import { NextRequest, NextResponse } from "next/server";
import { fetchRecentComments } from "@/lib/github";

export async function GET(request: NextRequest) {
  try {
    // URL 파라미터에서 count 가져오기
    const searchParams = request.nextUrl.searchParams;
    const countParam = searchParams.get("count");
    const count = countParam ? parseInt(countParam, 10) : 5;

    // 댓글 데이터 가져오기
    const comments = await fetchRecentComments(count);

    // 응답 반환 (짧은 캐시 적용)
    return new NextResponse(JSON.stringify(comments), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("댓글 API 오류:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
