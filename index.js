import { intToString, changeTime } from "./utils.js";


let inputValue;
let btnSearch;
let videosList;
let inputtedUserQuestion;
let videosObject = new Object();
let prevButton;
let nextButton;
let footer;
let nextPageToken;
let prevPageToken;
const apiKey = "&key=AIzaSyARGEwG0nCqRWFtFUy-wXdPuRb5_MttWDc";

const main = () => {
  prepareDOMElements();
  prepareDOMEvents();
  getInputedValue();
};

const prepareDOMElements = () => {
  inputValue = document.querySelector(".searchBar");
  btnSearch = document.querySelector(".submitSearch");
  videosList = document.querySelector(".content");
  prevButton = document.querySelector(".prevPage");
  nextButton = document.querySelector(".nextPage");
  footer = document.querySelector(".footer");
};

const prepareDOMEvents = () => {
  btnSearch.addEventListener("click", getInputedValue);
};

const getInputedValue = () => {
  inputtedUserQuestion = inputValue.value || "dogs";
  if (videosList.children.length > 0) {
    videosList.innerHTML = "";
    for (const key in videosObject) {
      delete videosObject[key];
    }
    getApiResponse();
  } else {
    getApiResponse();
  }
};
function replacer(key, value) {
  if (value instanceof Map) {
    return {
      dataType: "Map",
      value: Array.from(value.entries()),
    };
  } else {
    return value;
  }
}

const getApiResponse = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  console.log(urlParams)
  const pageToken = urlParams.get('pageToken')
  console.log(pageToken)
  const pageTokenQueryParam = pageToken ? `&pageToken=${pageToken}` : '';
  const searchUrl = `https://youtube.googleapis.com/youtube/v3/search?&type=video&channelType=any&part=snippet&maxResults=10&q=${inputtedUserQuestion}${pageTokenQueryParam}`;
  const channelInfUrl = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&id=`;
  const videoInfUrl = `https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=`;

  const apiSearchResponse = await axios.get(searchUrl + apiKey);
  const listOfVideos = apiSearchResponse.data.items;

  const channelIds = listOfVideos.map((id) => id.snippet.channelId);
  const channelIdsString = channelIds.join(",");
  nextPageToken = apiSearchResponse.data.nextPageToken;
  prevPageToken = apiSearchResponse.data.prevPageToken;
  

  const apiChannelInfResponse = await axios.get(
    channelInfUrl + channelIdsString + apiKey
  );
  const listOfChannels = apiChannelInfResponse.data.items;

  const channelThumbnail = new Map(
    listOfChannels.map((thmb) => [thmb.id, thmb.snippet.thumbnails.default.url])
  );

  const videoIds = listOfVideos.map((video) => video.id.videoId);

  const allIdString = videoIds.toString();
  const apiVideoStatsRespone = await axios.get(
    videoInfUrl + allIdString + apiKey
  );
  const videosStatistics = apiVideoStatsRespone.data.items;

  listOfVideos.forEach((video) => (videosObject[video.id.videoId] = {}));

  const objectLen = Object.getOwnPropertyNames(videosObject);
  for (let i = 0; i < objectLen.length; i++) {
    //if (listOfVideos[i].id.videoId === videoIds[i]) {
    videosObject[videoIds[i]] = {
      ...listOfVideos[i].snippet,
      ...videosStatistics[i].statistics,
      videoId: videosStatistics[i].id,
      //tags: videosStatistics[i].snippet.tags
    };
  }
  localStorage.setItem("videos", JSON.stringify(videosObject));
  localStorage.setItem("thumbs", JSON.stringify(channelThumbnail, replacer));
  localStorage.setItem("ids", JSON.stringify(allIdString));
  console.log(prevPageToken)

  footer.style.display = "flex";
  if(prevPageToken != undefined) {
  prevButton.style.display = "flex"
  prevButton.setAttribute("href", `index.html?pageToken=${prevPageToken}`);
  }
  nextButton.setAttribute("href", `index.html?pageToken=${nextPageToken}`);
  

  createVideoDiv(videoIds, objectLen, listOfVideos, channelThumbnail);
};


const createVideoDiv = (
  videoIds,
  objectLen,
  listOfVideos,
  channelThumbnail
) => {
  const channelIcon = channelThumbnail;
  for (let i = 0; i < objectLen.length; i++) {
    const video = videosObject[videoIds[i]];
    const icon = channelIcon.get(listOfVideos[i].snippet.channelId);

    // Appending main DIV.
    const anchor = document.createElement("a");
    anchor.setAttribute("href", `watch.html?id=${video.videoId}`);

    anchor.classList.add("first", video.videoId);
    anchor.setAttribute("data-url", video.videoId);
    videosList.append(anchor);

    // Appending thumbnails.
    const thumbnail = video.thumbnails.medium.url;
    const newThumbnail = document.createElement("img");
    newThumbnail.classList.add("videoThumbnail");
    newThumbnail.setAttribute("src", thumbnail);
    anchor.append(newThumbnail);

    // Appendinig info-div.
    const infoDiv = document.createElement("div");
    infoDiv.classList.add("videoInfo");
    anchor.append(infoDiv);

    //Appending paragraph into info-div.
    const titleParagraph = document.createElement("p");
    titleParagraph.classList.add("title");
    titleParagraph.textContent = video.title;
    infoDiv.append(titleParagraph);

    //Appending views and time from addition
    const viewsAndTimeParagraph = document.createElement("p");
    viewsAndTimeParagraph.classList.add("viewsAndTime");
    const publishedAt = video.publishedAt;
    viewsAndTimeParagraph.textContent = `${intToString(
      video.viewCount
    )} views ▴ ${changeTime(publishedAt)} ago`;
    infoDiv.append(viewsAndTimeParagraph);

    //Appending channel thumbnail and channel name to
    const channelDiv = document.createElement("div");
    channelDiv.classList.add("channel");
    infoDiv.append(channelDiv);

    const channelThumbnail = document.createElement("img");
    channelThumbnail.classList.add("channelThumbnail");
    channelThumbnail.setAttribute("src", icon);
    channelDiv.append(channelThumbnail);

    const channelName = document.createElement("p");
    channelName.classList.add("channelName");
    channelName.textContent = video.channelTitle;
    channelDiv.append(channelName);

    //Appending video description
    const videoDescription = document.createElement("p");
    videoDescription.classList.add("videoDescription");
    videoDescription.textContent = video.description;
    infoDiv.append(videoDescription);
  }
};

document.addEventListener("DOMContentLoaded", main);