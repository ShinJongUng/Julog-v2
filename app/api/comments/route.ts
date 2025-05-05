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

    // 응답 반환
    return NextResponse.json(comments);
  } catch (error) {
    console.error("댓글 API 오류:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
