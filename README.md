# Julog v2

## 개발 목적

- 군 생활 중 Cursor와 roo code를 꼭 써보고싶은데 마땅한 side project가 생각이 안난다.
- 따라서 AI IDE를 활용하여 최고의 블로그를 만든다.

## Project setup

- 댓글 기능을 위해 giscus와 github token이 필요하다

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
