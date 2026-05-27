export type FeedComment = {
  id: string;
  author: string;
  time: string;
  content: string;
  replyTo?: string;
};

export type FeedPost = {
  id: string;
  author: string;
  authorTag: string;
  time: string;
  location: string;
  content: string;
  topics: string[];
  media: string[];
  likes: number;
  comments: number;
  shares: number;
  liked?: boolean;
  commentList: FeedComment[];
};

export const feedPosts: FeedPost[] = [
  {
    id: "post-001",
    author: "小满同学",
    authorTag: "校园达人",
    time: "10 分钟前",
    location: "杭州·滨江",
    content:
      "刚在楼下夜市发现一家超适合下班后坐一会儿的小摊，烤年糕和冰豆花绝配。有人要不要一起冲，顺便把今晚的 citywalk 路线也发出来。",
    topics: ["夜市", "同城发现", "citywalk"],
    media: ["摊位一角", "豆花特写", "街边氛围"],
    likes: 128,
    comments: 36,
    shares: 12,
    liked: true,
    commentList: [
      {
        id: "post-001-c1",
        author: "木木",
        time: "刚刚",
        content: "这个夜市氛围看着不错，求具体位置。",
      },
      {
        id: "post-001-c2",
        author: "小汐",
        time: "8 分钟前",
        content: "烤年糕看起来太香了，今晚我也去试试。",
      },
    ],
  },
  {
    id: "post-002",
    author: "南风",
    authorTag: "生活记录",
    time: "32 分钟前",
    location: "上海·徐汇",
    content:
      "今天把一直想做的 7 天极简穿搭整理出来了，发现真正常穿的其实就那几件。准备把搭配思路写成一条长图文，先发个动态收集下大家想看的方向。",
    topics: ["穿搭", "灵感记录"],
    media: ["衣柜角落", "今日搭配"],
    likes: 209,
    comments: 54,
    shares: 21,
    commentList: [
      {
        id: "post-002-c1",
        author: "西柚",
        time: "12 分钟前",
        content: "想看你那套基础款怎么搭出层次感。",
      },
    ],
  },
  {
    id: "post-003",
    author: "阿岛",
    authorTag: "美食收集",
    time: "1 小时前",
    location: "广州·天河",
    content:
      "新开的一家面包店真的很能打，黄油碱水和开心果可颂都在线。已经替你们试过了，不踩雷，周末想去拍照打卡的可以直接收藏。",
    topics: ["探店", "面包脑袋", "周末去哪"],
    media: ["门头", "面包陈列", "座位区", "开心果可颂"],
    likes: 356,
    comments: 67,
    shares: 45,
    commentList: [
      {
        id: "post-003-c1",
        author: "Kiki",
        time: "5 分钟前",
        content: "面包脑袋已经收藏，周末冲。",
      },
      {
        id: "post-003-c2",
        author: "阿远",
        time: "21 分钟前",
        content: "开心果可颂一票，记得早点去。",
      },
    ],
  },
];
