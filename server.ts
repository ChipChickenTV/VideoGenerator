import express from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = parseInt(process.env.PORT || '3030', 10);

// POST 요청의 body를 json으로 파싱하기 위함
app.use(express.json());

// 렌더링된 비디오를 제공하기 위한 정적 파일 서버 설정
app.use('/static', express.static(path.join(__dirname, 'public')));

// 비디오 렌더링을 위한 POST 엔드포인트
app.post('/render', (req, res) => {
    const inputProps = req.body;

    if (!inputProps) {
        return res.status(400).send({ error: 'Request body with input props is required.' });
    }

    // 렌더링 요청마다 고유한 임시 파일 생성
    const tempInputFilePath = path.join(__dirname, `temp-input-${Date.now()}.json`);
    fs.writeFileSync(tempInputFilePath, JSON.stringify(inputProps));

    // 렌더링 결과물이 저장될 경로 (public 폴더가 없다면 생성)
    const outputDir = path.join(__dirname, 'public');
    if (!fs.existsSync(outputDir)){
        fs.mkdirSync(outputDir);
    }
    const outputFileName = `output-${Date.now()}`;
    const outputFilePath = path.join(outputDir, outputFileName + '.mp4');
    
    // Remotion CLI 렌더링 명령어 실행
    // [참고] 다른 Composition을 렌더링하려면 아래 "YouTubeShorts" 부분을
    // src/Root.tsx에 정의된 다른 ID(예: "AnimationTest")로 변경하세요.
    const command = `npm run render:headless -- ${outputFileName} ${tempInputFilePath}`;

    console.log(`Executing command: ${command}`);

    exec(command, (error, stdout, stderr) => {
        // 렌더링이 끝나면 임시 입력 파일 삭제
        fs.unlinkSync(tempInputFilePath);

        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send({ error: 'Failed to render video.', details: stderr });
        }

        console.log(`stdout: ${stdout}`);
        
        // 렌더링된 파일에 접근할 수 있는 URL 생성 (요청된 호스트 자동 감지)
        const host = req.get('host') || `localhost:${PORT}`;
        const protocol = req.secure ? 'https' : 'http';
        const videoUrl = `${protocol}://${host}/static/${outputFileName}.mp4`;

        res.status(200).send({ 
            message: 'Video rendered successfully!',
            outputPath: outputFilePath,
            videoUrl: videoUrl
        });
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on all interfaces:${PORT}`);
    console.log(`Local access: http://localhost:${PORT}`);
    console.log(`POST endpoint: /render`);
    console.log(`External access available via your public IP`);
});