import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { getAllAnimations } from '../src/animations';
import { AnimationInfo } from '../src/animations/types';

const publicDir = path.resolve(process.cwd(), 'public');

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

interface ShowcaseData {
  categories: {
    type: string;
    title: string;
    animations: AnimationInfo[];
  }[];
}

async function main() {
  console.log('🎬 VideoWeb3 애니메이션 Showcase 데이터 생성 시작!');

  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  const animations = getAllAnimations();
  console.log(`📊 총 ${animations.length}개의 애니메이션 발견`);

  const categorized: Record<string, AnimationInfo[]> = {
    image: [],
    text: [],
    transition: [],
    filter: [],
    highlight: [],
  };

  animations.forEach(anim => {
    if (categorized[anim.type]) {
      categorized[anim.type].push(anim);
    }
  });

  const showcaseData: ShowcaseData = {
    categories: Object.entries(categorized)
      .map(([type, items]) => ({
        type,
        title: getCategoryTitle(type),
        animations: items,
      }))
      .filter(category => category.animations.length > 0),
  };

  const outputPath = path.resolve(publicDir, 'animations.json');
  writeFileSync(outputPath, JSON.stringify(showcaseData, null, 2));

  console.log(`\n🎉 Showcase 데이터 생성 완료!`);
  console.log(`📁 JSON 파일 경로: ${outputPath}`);
}

main().catch(err => {
  console.error('💥 Showcase 데이터 생성 중 오류 발생:', err);
  process.exit(1);
});