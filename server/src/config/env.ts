import dotenv from 'dotenv';

dotenv.config();

// 필수 환경변수 검증 (fail closed)
// - NODE_ENV=test 인 경우는 예외 처리 (테스트는 자체 환경 구성)
// - 누락 시 명확한 에러로 起動을 차단한다

const REQUIRED_VARS = ['JWT_SECRET'] as const;

function isBlank(value: string | undefined): boolean {
  return value === undefined || value.trim() === '';
}

export function validateEnv(): void {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  const missing: string[] = REQUIRED_VARS.filter((key) => isBlank(process.env[key]));

  // DB 연결: DATABASE_URL 또는 개별 변수 세트(DB_HOST/DB_USER/DB_NAME) 중 하나는 반드시 필요
  const hasDatabaseUrl = !isBlank(process.env.DATABASE_URL);
  const hasDiscreteDbConfig =
    !isBlank(process.env.DB_HOST) &&
    !isBlank(process.env.DB_USER) &&
    !isBlank(process.env.DB_NAME);

  if (!hasDatabaseUrl && !hasDiscreteDbConfig) {
    missing.push('DATABASE_URL (또는 DB_HOST/DB_USER/DB_NAME 조합)');
  }

  if (missing.length > 0) {
    throw new Error(
      `필수 환경변수가 누락되어 서버를 시작할 수 없습니다: ${missing.join(', ')}`
    );
  }
}
