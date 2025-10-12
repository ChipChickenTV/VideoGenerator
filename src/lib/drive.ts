import { drive, drive_v3 } from '@googleapis/drive';
import { OAuth2Client } from 'google-auth-library';
import { createReadStream } from 'fs';
import { Readable } from 'stream';

const DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive'];
const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';

let driveClient: drive_v3.Drive | null = null;
let oauthClient: OAuth2Client | null = null;

function getOAuthClient(): OAuth2Client {
  if (oauthClient) {
    return oauthClient;
  }

  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GOOGLE_REDIRECT_URI } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    throw new Error('Google OAuth 자격 증명(GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/GOOGLE_REFRESH_TOKEN)이 .env에 설정되어 있지 않습니다.');
  }

  const redirectUri = GOOGLE_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob';
  const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUri);
  client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN, scope: DRIVE_SCOPES.join(' ') });

  oauthClient = client;
  return client;
}

function getDriveClient(): drive_v3.Drive {
  if (driveClient) {
    return driveClient;
  }

  const authClient = getOAuthClient();
  const client = drive({ version: 'v3', auth: authClient });
  driveClient = client;
  return client;
}

function escapeForQuery(value: string): string {
  return value.replace(/['\\]/g, '\\$&');
}

async function findFolderByName(parentId: string, folderName: string): Promise<drive_v3.Schema$File | undefined> {
  const drive = getDriveClient();
  const query = `'${parentId}' in parents and mimeType='${FOLDER_MIME_TYPE}' and trashed=false and name='${escapeForQuery(folderName)}'`;
  const { data } = await drive.files.list({
    q: query,
    fields: 'files(id, name)',
    pageSize: 1,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  return data.files?.[0];
}

export async function ensureDriveFolder(parentId: string, folderName: string): Promise<{ id: string; name: string }> {
  const drive = getDriveClient();
  const existing = await findFolderByName(parentId, folderName);

  if (existing?.id) {
    return { id: existing.id, name: existing.name || folderName };
  }

  const { data } = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: FOLDER_MIME_TYPE,
      parents: [parentId],
    },
    fields: 'id, name',
    supportsAllDrives: true,
  });

  if (!data.id) {
    throw new Error(`'${folderName}' 폴더 생성에 실패했습니다.`);
  }

  return { id: data.id, name: data.name || folderName };
}

export async function ensureDrivePath(rootFolderId: string, path: string | string[]): Promise<{ id: string; segments: { id: string; name: string }[] }> {
  const segments = Array.isArray(path) ? path : path.split('/').map((part) => part.trim()).filter(Boolean);

  let currentId = rootFolderId;
  const walked: { id: string; name: string }[] = [];

  for (const segment of segments) {
    const { id, name } = await ensureDriveFolder(currentId, segment);
    currentId = id;
    walked.push({ id, name });
  }

  return { id: currentId, segments: walked };
}

export type UploadToDriveOptions = {
  targetFolderId: string;
  fileName: string;
  mimeType?: string;
  makePublic?: boolean;
};

export type UploadToDriveResult = {
  fileId: string;
  publicUrl: string;
  webViewUrl: string;
  name: string;
  parents?: string[];
};

export async function uploadToGoogleDrive(localPath: string, options: UploadToDriveOptions): Promise<UploadToDriveResult> {
  const drive = getDriveClient();
  const { targetFolderId, fileName, mimeType = 'video/mp4', makePublic = true } = options;

  if (!targetFolderId) {
    throw new Error('업로드 대상 폴더 ID가 지정되지 않았습니다.');
  }

  if (!fileName) {
    throw new Error('업로드 파일명이 지정되지 않았습니다.');
  }

  console.log(`📁 Google Drive 업로드 시작: ${fileName}`);
  console.log(`  - 대상 폴더 ID: ${targetFolderId}`);

  const query = `'${targetFolderId}' in parents and name='${escapeForQuery(fileName)}' and trashed=false`;
  const existing = await drive.files.list({
    q: query,
    fields: 'files(id)',
    pageSize: 1,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  const media = {
    mimeType,
    body: createReadStream(localPath),
  };

  let fileId: string;
  let webViewUrl: string | undefined;

  if (existing.data.files?.[0]?.id) {
    const updateResponse = await drive.files.update({
      fileId: existing.data.files[0].id,
      media,
      fields: 'id, webViewLink, parents, name',
      supportsAllDrives: true,
    });

    fileId = updateResponse.data.id as string;
    webViewUrl = updateResponse.data.webViewLink || undefined;
  } else {
    const createResponse = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [targetFolderId],
      },
      media,
      fields: 'id, webViewLink, parents, name',
      supportsAllDrives: true,
    });

    if (!createResponse.data.id) {
      throw new Error('Google Drive 파일 생성에 실패했습니다.');
    }

    fileId = createResponse.data.id;
    webViewUrl = createResponse.data.webViewLink || undefined;
  }

  if (makePublic) {
    try {
      await drive.permissions.create({
        fileId,
        requestBody: {
          type: 'anyone',
          role: 'reader',
        },
      });
    } catch (error: any) {
      const message = error?.errors?.[0]?.message || error?.message || '';
      if (!message.includes('cannotAddMyself') && !message.includes('alreadyExists')) {
        console.warn(`⚠️ 공개 퍼미션 설정 중 오류가 발생했습니다. (${message})`);
      }
    }
  }

  const publicUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;

  console.log('✅ Google Drive 업로드 완료');
  console.log(`🔗 공개 URL: ${publicUrl}`);

  const metadata = (
    await drive.files.get({
      fileId,
      fields: 'id, parents, name',
      supportsAllDrives: true,
    })
  ).data as drive_v3.Schema$File;

  return {
    fileId,
    publicUrl,
    webViewUrl: webViewUrl ?? `https://drive.google.com/file/d/${fileId}/view`,
    name: metadata.name ?? fileName,
    parents: metadata.parents ?? undefined,
  };
}

export function extractDriveFileIdFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    const idFromQuery = parsed.searchParams.get('id');
    if (idFromQuery) {
      return idFromQuery;
    }

    const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
    if (fileMatch?.[1]) {
      return fileMatch[1];
    }

    const ucDirect = parsed.pathname === '/uc';
    if (ucDirect) {
      const directId = parsed.searchParams.get('export') === 'download' ? parsed.searchParams.get('id') : null;
      if (directId) {
        return directId;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function extractDriveFolderIdFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const folderMatch = parsed.pathname.match(/\/folders\/([^/]+)/);
    if (folderMatch?.[1]) {
      return folderMatch[1];
    }
    return null;
  } catch {
    return null;
  }
}

export type DriveFileDownloadResult = {
  stream: Readable;
  metadata: drive_v3.Schema$File | null;
  headers: Record<string, string | string[] | undefined>;
  status: number;
};

export async function downloadDriveFile(
  fileId: string,
  options: { rangeHeader?: string } = {}
): Promise<DriveFileDownloadResult> {
  const drive = getDriveClient();

  const metadataPromise = drive.files.get({
    fileId,
    fields: 'id, name, mimeType, size, md5Checksum',
    supportsAllDrives: true,
  });

  const mediaResponse = await drive.files.get(
    {
      fileId,
      alt: 'media',
      supportsAllDrives: true,
    },
    {
      responseType: 'stream',
      headers: options.rangeHeader ? { Range: options.rangeHeader } : undefined,
    }
  );

  const metadata = await metadataPromise;

  return {
    stream: mediaResponse.data as unknown as Readable,
    metadata: metadata.data ?? null,
    headers: mediaResponse.headers,
    status: mediaResponse.status,
  };
}

export async function getDriveFileMetadata(fileId: string): Promise<drive_v3.Schema$File | null> {
  if (!fileId) {
    return null;
  }

  const drive = getDriveClient();

  try {
    const { data } = await drive.files.get({
      fileId,
      fields: 'id, name, parents',
      supportsAllDrives: true,
    });

    return data;
  } catch (error) {
    console.warn(`⚠️ 파일 메타데이터 조회 실패 (fileId=${fileId})`, error);
    return null;
  }
}

export async function getFolderPath(folderId: string, stopAtId?: string): Promise<string[]> {
  const drive = getDriveClient();
  const chain: string[] = [];
  const visited = new Set<string>();
  let currentId: string | undefined = folderId;

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const data = (
      await drive.files.get({
        fileId: currentId,
        fields: 'id, name, parents',
        supportsAllDrives: true,
      })
    ).data as drive_v3.Schema$File;

    if (data.name) {
      chain.unshift(data.name);
    }

    const parent = data.parents?.[0];
    if (!parent || parent === stopAtId) {
      break;
    }

    currentId = parent;
  }

  return chain;
}
