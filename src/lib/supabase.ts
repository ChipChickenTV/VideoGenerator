import fetch from 'node-fetch';
import { promises as fs } from 'fs';

// .env 파일에서 환경 변수를 로드하기 위해 dotenv를 설정합니다.
// 이 파일이 서버 시작점보다 먼저 로드되지 않을 수 있으므로,
// 사용하는 곳(server.ts)에서 직접 dotenv.config()를 호출하는 것이 더 안정적입니다.

/**
 * Supabase Storage에 파일을 업로드합니다.
 * @param localPath 업로드할 로컬 파일 경로
 * @param supabasePath Supabase Storage 내에 저장될 경로 (버킷명 포함)
 * @returns 업로드된 파일의 공개 URL
 */
export async function uploadToSupabase(localPath: string, bucket: string, supabasePath: string): Promise<string> {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase URL 또는 Service Role Key가 환경 변수에 설정되지 않았습니다.');
  }

  console.log(`📦 '${localPath}' 파일을 Supabase에 업로드 시작...`);
  console.log(`  - 버킷: ${bucket}`);
  console.log(`  - 경로: ${supabasePath}`);

  // 파일 데이터 읽기
  const fileBuffer = await fs.readFile(localPath);

  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${supabasePath}`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'video/mp4',
      // Supabase는 파일 덮어쓰기를 위해 'x-upsert' 헤더를 사용할 수 있습니다.
      // 여기서는 기본적으로 덮어쓰도록 설정합니다.
      'x-upsert': 'true',
    },
    body: fileBuffer,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('❌ Supabase 업로드 실패:', errorBody);
    throw new Error(`Supabase 업로드 실패: ${response.status} ${response.statusText}`);
  }

  // 업로드 성공 시, 공개 URL 생성
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${supabasePath}`;
  
  console.log(`✅ Supabase 업로드 성공!`);
  console.log(`🔗 공개 URL: ${publicUrl}`);

  return publicUrl;
}