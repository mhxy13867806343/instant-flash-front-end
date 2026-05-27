import { requestMock } from "@/utils/request";

const topicLibrary = [
  "同城发现",
  "灵感记录",
  "今日穿搭",
  "周末去哪",
  "探店日常",
  "夜市打卡",
  "咖啡时间",
  "运动搭子",
  "露营计划",
  "城市漫游",
  "美食测评",
  "拍照机位",
  "Live现场",
  "深夜食堂",
  "早八通勤",
  "小众书店",
];

export const recommendedTopicOptions = topicLibrary.slice(0, 8);

export async function searchTopicOptions(keyword: string) {
  const normalizedKeyword = keyword.replace(/^#/, "").trim().toLowerCase();

  return requestMock(() => {
    if (!normalizedKeyword) {
      return [];
    }

    return topicLibrary
      .filter((item) => item.toLowerCase().includes(normalizedKeyword))
      .slice(0, 8);
  }, 180);
}
