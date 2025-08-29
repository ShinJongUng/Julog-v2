"use client";

import { lazy } from "react";

// React.lazy를 사용해 클라이언트에서만 코드 분할 + 지연 로딩
const TableOfContentsLazy = lazy(() => import("../TableOfContents"));

export default TableOfContentsLazy;
