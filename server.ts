import express from 'express';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import http from 'http';
import dotenv from 'dotenv';

// 환경변수 로딩
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const app = express();
const PORT = parseInt(process.env.PORT || '3030', 10);

// POST 요청의 body를 json으로 파싱하기 위함
app.use(express.json());

// Supabase REST API 헬퍼 함수들
async function downloadFromSupabase(bucket: string, fileName: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const url = `${SUPABASE_URL}/storage/v1/object/${bucket}/${fileName}`;
        const headers = {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
        };

        console.log(`📥 Downloading from Supabase: ${bucket}/${fileName}`);
        
        const request = http.get(url, { headers }, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download file: ${response.statusCode} ${response.statusMessage}`));
                return;
            }

            const chunks: Buffer[] = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => {
                const buffer = Buffer.concat(chunks);
                console.log(`✅ Downloaded ${buffer.length} bytes from ${bucket}/${fileName}`);
                resolve(buffer);
            });
        });

        request.on('error', (error) => {
            reject(new Error(`Download request failed: ${error.message}`));
        });
    });
}

async function uploadToSupabase(bucket: string, fileName: string, fileBuffer: Buffer, contentType: string = 'video/mp4'): Promise<string> {
    return new Promise((resolve, reject) => {
        const url = `${SUPABASE_URL}/storage/v1/object/${bucket}/${fileName}`;
        const headers = {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': contentType,
            'Content-Length': fileBuffer.length.toString()
        };

        console.log(`📤 Uploading to Supabase: ${bucket}/${fileName} (${fileBuffer.length} bytes)`);
        
        const request = http.request(url, {
            method: 'POST',
            headers
        }, (response) => {
            let responseData = '';
            response.on('data', (chunk) => {
                responseData += chunk;
            });
            
            response.on('end', () => {
                if (response.statusCode === 200 || response.statusCode === 201) {
                    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`;
                    console.log(`✅ Uploaded successfully to ${bucket}/${fileName}`);
                    resolve(publicUrl);
                } else {
                    console.error(`Upload failed: ${response.statusCode} ${response.statusMessage}`);
                    console.error('Response:', responseData);
                    reject(new Error(`Upload failed: ${response.statusCode} ${response.statusMessage}`));
                }
            });
        });

        request.on('error', (error) => {
            reject(new Error(`Upload request failed: ${error.message}`));
        });

        request.write(fileBuffer);
        request.end();
    });
}

// (checkBucketExists 함수 제거됨 - 더 이상 사용하지 않음)

// URL에서 버킷과 파일 경로 추출하는 함수
function parseSupabaseUrl(url: string): { bucket: string, filePath: string } {
    // URL 형식: http://host:port/storage/v1/object/public/{bucket}/{filePath}
    const urlPattern = /\/storage\/v1\/object\/public\/([^\/]+)\/(.+)$/;
    const match = url.match(urlPattern);
    
    if (!match) {
        throw new Error('Invalid Supabase Storage URL format');
    }
    
    return {
        bucket: match[1],
        filePath: match[2]
    };
}

// 비디오 렌더링을 위한 POST 엔드포인트
app.post('/render', async (req, res) => {
    const { inputUrl } = req.body;

    if (!inputUrl) {
        return res.status(400).send({ 
            error: 'inputUrl is required.',
            example: {
                inputUrl: 'http://180.228.166.151:54321/storage/v1/object/public/ssul/FinalResult/iimhllmeiba.json'
            }
        });
    }

    // URL에서 버킷과 파일 경로 추출
    let inputBucket: string, inputFileName: string;
    try {
        const parsed = parseSupabaseUrl(inputUrl);
        inputBucket = parsed.bucket;
        inputFileName = parsed.filePath;
    } catch (error) {
        return res.status(400).send({
            error: 'Invalid inputUrl format.',
            details: error instanceof Error ? error.message : 'Unknown error',
            expected: 'http://your-supabase-url/storage/v1/object/public/{bucket}/{filePath}'
        });
    }

    // 입력 경로 파싱 (폴더 구조가 바뀌어도 동작하도록)
    const inputParts = inputFileName.split('/');
    const inputFileNameOnly = inputParts[inputParts.length - 1]; // 예: "iimhllmeiba.json"
    const inputBaseName = inputFileNameOnly.replace('.json', ''); // 예: "iimhllmeiba"
    const inputFolderPath = inputParts.slice(0, -1).join('/'); // 예: "FinalResult" 또는 "folder/subfolder"
    
    // 임시 파일 경로들
    const tempInputFilePath = path.join(__dirname, `temp-input-${Date.now()}.json`);
    const outputDir = path.join(__dirname, 'out');
    
    try {
        // 1. Supabase에서 입력 JSON 다운로드
        console.log(`🔍 Checking input file: ${inputBucket}/${inputFileName}`);
        const inputBuffer = await downloadFromSupabase(inputBucket, inputFileName);
        
        // 2. JSON 파싱 및 임시 파일 생성
        const inputJson = JSON.parse(inputBuffer.toString('utf-8'));
        
        // 3. 동적으로 출력 경로 및 파일명 생성 (JSON 파일명과 동일한 해시값 사용)
        const finalOutputFileName = inputBaseName; // 예: "iimhllmeiba"
        const outputFilePath = path.join(outputDir, finalOutputFileName + '.mp4');
        
        // 출력 버킷과 경로 설정 (입력과 동일한 구조 사용)
        const finalOutputBucket = inputBucket;
        const outputFilePathInSupabase = inputFolderPath 
            ? `${inputFolderPath}/${finalOutputFileName}.mp4` 
            : `${finalOutputFileName}.mp4`;
        fs.writeFileSync(tempInputFilePath, JSON.stringify(inputJson));
        console.log(`📄 Created temp input file: ${tempInputFilePath}`);

        // 3. 출력 디렉토리 생성
        if (!fs.existsSync(outputDir)){
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // 4. Remotion CLI 렌더링 명령어 실행
        console.log(`🎬 Starting render: ${finalOutputFileName}`);
        
        const renderProcess = spawn('npm', ['run', 'render:headless', '--', finalOutputFileName, tempInputFilePath], {
            stdio: 'pipe',
            shell: true
        });

        let stdout = '';
        let stderr = '';

        // 실시간 stdout 로그 출력
        renderProcess.stdout.on('data', (data) => {
            const output = data.toString();
            stdout += output;
            console.log(`[RENDER] ${output.trim()}`);
        });

        // 실시간 stderr 로그 출력
        renderProcess.stderr.on('data', (data) => {
            const error = data.toString();
            stderr += error;
            console.error(`[RENDER ERROR] ${error.trim()}`);
        });

        // 프로세스 완료 처리
        renderProcess.on('close', async (code) => {
            // 임시 입력 파일 삭제
            try {
                fs.unlinkSync(tempInputFilePath);
                console.log(`🗑️ Deleted temp input file: ${tempInputFilePath}`);
            } catch (err) {
                console.error('Failed to delete temp input file:', err);
            }

            if (code !== 0) {
                console.error(`🚫 Render process exited with code ${code}`);
                return res.status(500).send({ 
                    error: 'Failed to render video.', 
                    details: stderr,
                    exitCode: code 
                });
            }

            try {
                // 5. 렌더링된 비디오를 Supabase Storage에 업로드
                console.log(`📤 Uploading video to Supabase Storage...`);
                console.log(`📍 Upload path: ${finalOutputBucket}/${outputFilePathInSupabase}`);
                const videoBuffer = fs.readFileSync(outputFilePath);
                
                const publicUrl = await uploadToSupabase(finalOutputBucket, outputFilePathInSupabase, videoBuffer, 'video/mp4');

                // 6. 로컬 비디오 파일 삭제 (선택사항)
                try {
                    fs.unlinkSync(outputFilePath);
                    console.log(`🗑️ Deleted local video file: ${outputFilePath}`);
                } catch (err) {
                    console.error('Failed to delete local video file:', err);
                }

                console.log(`✅ Render and upload completed successfully!`);
                
                // 7. 성공 응답
                res.status(200).send({ 
                    success: true,
                    message: 'Video rendered and uploaded successfully!',
                    input: {
                        url: inputUrl,
                        bucket: inputBucket,
                        fileName: inputFileName
                    },
                    output: {
                        bucket: finalOutputBucket,
                        fileName: outputFilePathInSupabase,
                        publicUrl: publicUrl,
                        downloadUrl: `${SUPABASE_URL}/storage/v1/object/sign/${finalOutputBucket}/${outputFilePathInSupabase}`
                    }
                });

            } catch (uploadError) {
                console.error(`🚫 Upload failed:`, uploadError);
                res.status(500).send({ 
                    error: 'Video rendered successfully but upload failed.', 
                    details: uploadError instanceof Error ? uploadError.message : 'Unknown upload error',
                    localPath: outputFilePath
                });
            }
        });

        // 프로세스 에러 처리
        renderProcess.on('error', (error) => {
            console.error(`🚫 Failed to start render process:`, error);
            
            try {
                fs.unlinkSync(tempInputFilePath);
            } catch (err) {
                console.error('Failed to delete temp file:', err);
            }

            res.status(500).send({ 
                error: 'Failed to start render process.', 
                details: error.message 
            });
        });

    } catch (downloadError) {
        console.error(`🚫 Download failed:`, downloadError);
        
        // 임시 파일 정리
        try {
            if (fs.existsSync(tempInputFilePath)) {
                fs.unlinkSync(tempInputFilePath);
            }
        } catch (err) {
            console.error('Failed to delete temp file:', err);
        }

        res.status(500).send({ 
            error: 'Failed to download input file from Supabase.', 
            details: downloadError instanceof Error ? downloadError.message : 'Unknown download error',
            inputPath: `${inputBucket}/${inputFileName}`
        });
    }
});

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
    res.status(200).send({
        status: 'healthy',
        supabase: {
            url: SUPABASE_URL
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on all interfaces:${PORT}`);
    console.log(`Local access: http://localhost:${PORT}`);
    console.log(`POST endpoint: /render`);
    console.log(`Health check: /health`);
    console.log(`Supabase URL: ${SUPABASE_URL}`);
    console.log(`External access available via your public IP`);
});