import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import path from 'path';
import { getAllAnimations, AnimationInfo } from '../src/animations';

const showcaseDir = path.resolve(process.cwd(), 'showcase');
const videoDir = path.resolve(showcaseDir, 'videos');

function getCategoryTitle(type: string): string {
  const titles: Record<string, string> = {
    image: '🖼️ 이미지 애니메이션',
    text: '📝 텍스트 애니메이션',
    transition: '🎬 씬 전환 효과',
    filter: '🎨 이미지 필터',
    highlight: '🖍️ 텍스트 하이라이트',
  };
  return titles[type] || type;
}

async function renderMp4(compositionId: string, outputPath: string): Promise<boolean> {
  try {
    console.log(`Rendering ${compositionId} as MP4 (H264)...`);
    execSync(`npx remotion render ${compositionId} ${outputPath} --codec=h264`, {
      stdio: 'inherit',
      timeout: 120000,
    });
    console.log(`✅ ${compositionId} 렌더링 완료`);
    return true;
  } catch (error: any) {
    console.error(`❌ ${compositionId} 렌더링 실패:`, error.message);
    return false;
  }
}

function generateHTML(compositions: AnimationInfo[], renderedVideos: string[]): void {
  const categorized: Record<string, AnimationInfo[]> = {
    image: [], text: [], transition: [], filter: [], highlight: [],
  };

  compositions.forEach(comp => {
    const compositionId = `Showcase-${comp.type}-${comp.name}`;
    if (renderedVideos.includes(compositionId)) {
      categorized[comp.type].push(comp);
    }
  });

  const templatePath = path.resolve(showcaseDir, 'template.html');
  const template = readFileSync(templatePath, 'utf-8');

  const categoriesHtml = Object.entries(categorized).map(([type, items]) =>
    items.length > 0 ? `
      <div class="category" data-category="${type}">
          <h2 class="category-title">${getCategoryTitle(type)}</h2>
          <div class="grid">
              ${items.map(item => {
                const compositionId = `Showcase-${item.type}-${item.name}`;
                const videoSrc = `./videos/${compositionId}.mp4`;
                return `
                  <div class="animation-card">
                      <div class="video-container" data-video-src="${videoSrc}">
                          <video class="animation-video" autoplay loop muted playsinline preload="metadata">
                              <source src="${videoSrc}" type="video/mp4">
                          </video>
                      </div>
                      <div class="animation-name">${item.name}</div>
                      <div class="animation-description">${item.description}</div>
                  </div>
                `}).join('')}
          </div>
      </div>
    ` : ''
  ).join('');

  const filterButtonsHtml = `
    <button class="filter-btn active" data-category="all">All</button>
    ${Object.keys(categorized).map(type =>
      `<button class="filter-btn" data-category="${type}">${getCategoryTitle(type).split(' ')[1].replace('애니메이션', '').replace('효과', '')}</button>`
    ).join('')}
  `;

  let finalHtml = template.replace('{{CATEGORIES}}', categoriesHtml);
  finalHtml = finalHtml.replace('{{FILTER_BUTTONS}}', filterButtonsHtml);
  writeFileSync(path.resolve(showcaseDir, 'index.html'), finalHtml);
}

async function main() {
  console.log('🎬 VideoWeb3 애니메이션 Showcase 생성 시작! (H264 MP4 렌더링)');

  if (!existsSync(showcaseDir)) mkdirSync(showcaseDir);
  if (!existsSync(videoDir)) mkdirSync(videoDir);

  const compositions = getAllAnimations();
  console.log(`📊 총 ${compositions.length}개의 애니메이션 발견`);

  const renderedVideos: string[] = [];
  for (const comp of compositions) {
    const compositionId = `Showcase-${comp.type}-${comp.name}`;
    const outputPath = path.resolve(videoDir, `${compositionId}.mp4`);
    if (await renderMp4(compositionId, outputPath)) {
      renderedVideos.push(compositionId);
    }
  }

  generateHTML(compositions, renderedVideos);

  console.log(`\n🎉 Showcase 생성 완료!`);
  console.log(`📁 경로: ${showcaseDir}`);
  console.log(`🌐 HTML: ${path.resolve(showcaseDir, 'index.html')}`);
}

main().catch(err => {
  console.error('💥 Showcase 생성 중 오류 발생:', err);
  process.exit(1);
});