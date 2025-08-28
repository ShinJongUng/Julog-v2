// Notion API 응답 타입 정의
export interface NotionTitle {
  title: Array<{
    plain_text: string;
  }>;
}

export interface NotionRichText {
  rich_text: Array<{
    plain_text: string;
  }>;
}

export interface NotionDate {
  date: {
    start: string;
  } | null;
}

export interface NotionStatus {
  status: {
    name: string;
  };
}

export interface NotionMultiSelect {
  multi_select: Array<{
    name: string;
  }>;
}

export interface NotionFiles {
  files: Array<{
    file?: {
      url: string;
    };
    external?: {
      url: string;
    };
  }>;
}

// Notion 페이지 속성 타입
export interface NotionPageProperties {
  이름: NotionTitle;
  슬러그: NotionRichText;
  설명: NotionRichText;
  작성일: NotionDate;
  작성자: NotionRichText;
  상태: NotionStatus;
  태그: NotionMultiSelect;
  이미지: NotionFiles;
}
