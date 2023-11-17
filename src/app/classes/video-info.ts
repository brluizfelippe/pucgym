import { Video } from './video';

export class VideoInfo {
  videos: Array<Video>;
  videoSelected = new Video();
  loading: boolean;
  constructor() {
    this.videos = [];
    this.loading = true;
  }
  updateVideos(videos: Array<Video>) {
    this.videos = videos;
  }
  updateVideoSelected(videoSelected: Video) {
    this.videoSelected.update(videoSelected);
  }
  updateLoading(value: boolean) {
    this.loading = value;
  }
  update(videoInfo: VideoInfo) {
    this.updateVideos(videoInfo.videos);
    this.updateVideoSelected(videoInfo.videoSelected);
    this.updateLoading(videoInfo.loading);
  }

  public videoAmount() {
    return this.videos === undefined ? 0 : this.videos.length;
  }
}
