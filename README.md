# Julog v2

## 개발 목적

- 군 생활 중 Cursor와 roo code를 꼭 써보고싶은데 마땅한 side project가 생각이 안난다.
- 따라서 AI IDE를 활용하여 최고의 블로그를 만든다.

## 주요 특징

- **Notion 기반 콘텐츠 관리**: MDX 파일 대신 Notion 데이터베이스에서 직접 글 작성 및 관리
- **AI IDE 활용**: Cursor로 개발된 모던 블로그 시스템

## Project setup

### Notion API 설정 (필수)

1. [Notion Developers](https://www.notion.so/my-integrations)에서 Integration 생성
2. 데이터베이스 생성 후 Integration 연결
3. 환경변수 설정:
   ```env
   NOTION_TOKEN=your_notion_integration_token
   NOTION_DATABASE_ID=your_database_id
   ```

### 댓글 기능 설정

### Github Token 설정

1. Github 계정 설정에서 Developer Settings > Personal access tokens > Tokens으로 이동
2. 새로운 토큰 생성 시 아래 권한 필요:
   - repo:discussion
3. 생성된 토큰을 `.env.local` 파일에 아래와 같이 설정:
   ```
   GITHUB_TOKEN=your_token_here
   ```

### Giscus 설정

1. [Giscus 앱](https://github.com/apps/giscus)을 리포지토리에 설치
2. 해당 리포지토리의 Discussion 기능 활성화
3. [Giscus](https://giscus.app/ko)에서 설정값 생성 후 아래 환경변수 설정:
   ```
   NEXT_PUBLIC_GISCUS_REPO=username/repo
   NEXT_PUBLIC_GISCUS_REPO_ID=your_repo_id
   NEXT_PUBLIC_GISCUS_CATEGORY=General
   NEXT_PUBLIC_GISCUS_CATEGORY_ID=your_category_id
   ```

### 프로젝트 실행

1. pnpm 패키지 매니저 설치

   ```bash
   npm install -g pnpm
   ```

2. 의존성 설치

   ```bash
   pnpm install
   ```

3. 개발 서버 실행
   ```bash
   pnpm dev
   ```
