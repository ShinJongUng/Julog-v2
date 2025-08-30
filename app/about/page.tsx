import type { Metadata } from "next";
import Link from "next/link";
import { FaEnvelope, FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";
import { SiTistory } from "react-icons/si";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "About",
  description:
    "JULOG의 주인장을 소개합니다. 더불어 어떤 글을 작성하고, 제가 어떤 사람인지 소개합니다.",
};

export default function AboutPage() {
  const socials = [
    {
      name: "GitHub",
      url: "https://github.com/ShinJongUng",
      icon: <FaGithub size={20} />,
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/jongung-shin-357a85237",
      icon: <FaLinkedin size={20} />,
    },
    {
      name: "Tistory",
      url: "https://www.jongung.com/",
      icon: <SiTistory size={20} />,
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/photo.ung/",
      icon: <FaInstagram size={20} />,
    },
    {
      name: "E-mail",
      url: "mailto:work.jongung@gmail.com",
      icon: <FaEnvelope size={20} />,
    },
  ];
  return (
    <section className="py-8 md:py-10 mx-auto flex flex-col gap-2">
      {/* Main Title */}
      <h1 className="text-[1.5rem] sm:text-[2.5rem] font-normal mb-4 leading-tight whitespace-pre-line">
        사용자 경험을 중시하는 {"\n"}
        프로덕트 엔지니어 <strong>신종웅</strong>입니다.
      </h1>

      <blockquote className="bg-gray-50 rounded-xl p-4 sm:p-6 border-l-8 text-sm sm:text-base leading-relaxed">
        <p>
          안녕하세요! JULOG의 주인장 <strong>신종웅</strong>입니다.
          <br />
          <br />
          현재 공군 개발병으로 복무하며 웹 프론트엔드와 AI 시스템 기획을
          담당하고 있습니다.
          <br />
          스타트업, 외주, 사이드 프로젝트 등 다양한 환경에서 제품 개발의 전
          과정을 경험하며, 기술 자체보다 사용자의 경험과 문제 해결을 더
          우선시하는 개발자로 성장하고 있습니다.
          <br /> <br />이 블로그는 제가 프론트엔드를 중심으로 제품을 만들고,
          문제를 해결하는 과정을 기록하고 다양한 지식들을 정리하는 공간으로
          운영되고 있습니다.
          <br />
          이를 통해 제 성장 과정을 기록하고, 동시에 비슷한 길을 걷는 분들과
          경험을 공유하고자 합니다.
        </p>
      </blockquote>
      <div className="flex gap-4 w-full items-center justify-center mt-4">
        {socials.map((social) => (
          // Hover Tooltip
          <Tooltip key={social.name}>
            <TooltipTrigger>
              <Link
                key={social.name}
                href={social.url}
                target="_blank"
                title={social.name}
              >
                {social.icon}
              </Link>
            </TooltipTrigger>
            <TooltipContent>{social.name}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </section>
  );
}
