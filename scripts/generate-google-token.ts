import 'dotenv/config';
import { OAuth2Client } from 'google-auth-library';
import http from 'http';
import { URL } from 'url';
import { TOKEN_FILE_PATH, loadPersistedRefreshToken, persistRefreshToken } from '../src/lib/googleTokens';

const DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive'];

type LoopbackConfig = {
  port: number;
  path: string;
};

function parseLoopbackConfig(redirectUri: string): LoopbackConfig {
  const url = new URL(redirectUri);

  if (url.hostname !== 'localhost') {
    throw new Error('Desktop OAuth 클라이언트는 localhost 루프백 리디렉트를 사용해야 합니다. GOOGLE_REDIRECT_URI를 확인하세요.');
  }

  return {
    port: Number(url.port || 80),
    path: url.pathname || '/',
  };
}

async function waitForOAuthCode(config: LoopbackConfig): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (!req.url) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('잘못된 요청입니다.');
        return;
      }

      const requestUrl = new URL(req.url, `http://localhost:${config.port}`);

      if (requestUrl.pathname !== config.path) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('경로가 일치하지 않습니다.');
        return;
      }

      const code = requestUrl.searchParams.get('code');
      const error = requestUrl.searchParams.get('error');

      if (error) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('인증이 취소되었습니다. CLI로 돌아가 다시 시도하세요.');
        server.close();
        reject(new Error(`OAuth 인증이 취소되었습니다. (${error})`));
        return;
      }

      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('code 파라미터가 없습니다. CLI를 확인하세요.');
        server.close();
        reject(new Error('OAuth 코드가 포함되어 있지 않습니다.')); 
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h2>인증이 완료되었습니다.</h2><p>CLI 창으로 돌아가면 토큰이 저장됩니다.</p>');

      server.close();
      resolve(code);
    });

    server.on('error', (error) => {
      reject(error);
    });

    server.listen(config.port, '127.0.0.1', () => {
      console.log(`브라우저가 인증을 마치면 http://localhost:${config.port}${config.path} 로 돌아옵니다.`);
      console.log('브라우저 창에서 로딩이 끝나면 이 CLI가 자동으로 계속 진행됩니다.');
    });
  });
}

async function main(): Promise<void> {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    throw new Error('GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI 환경 변수를 모두 설정하세요.');
  }

  const loopback = parseLoopbackConfig(GOOGLE_REDIRECT_URI);
  const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: DRIVE_SCOPES,
    include_granted_scopes: true,
  });

  console.log('브라우저에서 아래 URL을 열어 Google Drive 권한을 승인하세요.');
  console.log(authUrl);
  console.log();
  console.log(`토큰은 승인 후 ${TOKEN_FILE_PATH}에 저장됩니다.`);
  console.log('CLI가 루프백 포트를 열었으니 브라우저에서 인증을 완료하면 자동으로 진행됩니다.');

  const code = await waitForOAuthCode(loopback);
  console.log('🔑 인증 코드를 수신했습니다. 토큰을 교환 중입니다...');

  const { tokens } = await client.getToken(code);

  if (tokens.refresh_token) {
    await persistRefreshToken(tokens.refresh_token);
    console.log('✅ 새 리프레시 토큰을 저장했습니다.');
  } else {
    const existing = await loadPersistedRefreshToken();
    if (existing) {
      console.warn('⚠️ 새 리프레시 토큰이 내려오지 않았습니다. 기존 저장된 토큰을 계속 사용합니다.');
    } else {
      throw new Error('리프레시 토큰이 내려오지 않았습니다. prompt=consent 파라미터가 포함되어 있는지 확인하세요.');
    }
  }

  if (tokens.access_token) {
    console.log('ℹ️ 이번 인증으로 발급된 access token은 1시간 유효합니다. 필요 시 즉시 테스트에 사용할 수 있습니다.');
  }
}

main().catch((error) => {
  console.error('❌ 토큰 발급 중 오류가 발생했습니다.');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
