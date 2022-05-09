import { intToString, changeTime } from "./utils.js";

const videos = JSON.parse(localStorage.getItem("videos"));
const thmb = JSON.parse(localStorage.getItem("thumbs"));
const ids = JSON.parse(localStorage.getItem("ids"));
const videoInfUrl = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=`;
const apiKey = "&key=AIzaSyARGEwG0nCqRWFtFUy-wXdPuRb5_MttWDc";
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const videoId = urlParams.get("id");

const video = videos[`${videoId}`];

const youtube = document.querySelector("iframe");
youtube.setAttribute("src", `https://www.youtube.com/embed/${video.videoId}`);

const title = document.querySelector(".title");
title.textContent = video.title;

const viewsTime = document.querySelector(".viewsAndTime");
viewsTime.textContent = `${intToString(video.viewCount)} views ▴ ${changeTime(
  video.publishedAt
)} ago`;

const like = document.querySelector(".likeCount");
like.textContent = intToString(video.likeCount);

const thmbId = thmb.value;
const thmbArray = [];
thmbId.forEach((el) => {
  if (video.channelId === el[0]) {
    thmbArray.push(el[1]);
  }
});

const channelThumbnail = document.querySelector(".channelThumbnail");
channelThumbnail.setAttribute("src", thmbArray[0]);

const channelName = document.querySelector(".channelName");
channelName.textContent = video.channelTitle;

const videoDescription = document.querySelector(".videoDescription");
videoDescription.textContent = video.description;

const apiVideoStatsRespone = await axios.get(videoInfUrl + ids + apiKey);

const tagsById = apiVideoStatsRespone.data.items;
const videoTags = [];
tagsById.forEach((el) => {
  if (video.videoId === el.id) {
    videoTags.push(el.snippet.tags);
  }
});

const tagsString = videoTags.toString();

const tags = document.querySelector(".tags");
tags.textContent = tagsString;
