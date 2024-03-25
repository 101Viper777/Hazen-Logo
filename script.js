document.addEventListener("DOMContentLoaded", function () {
    new ScrubVideoManager();
  });
  
  class ScrubVideoManager {
    
    constructor() {
      // Get a list of all scrub videos wrappers
      this.scrubVideoWrappers = document.querySelectorAll(".scrub-video-wrapper");
      
      // Create the intersectionObserver
      const observer = new IntersectionObserver(
        this.intersectionObserverCallback,
        { threshold: 1 }
      );
      // Add a pointer to the manager class so we can refer to it later
      observer.context = this;
  
      // Initialise empty cache of wrapper data
      this.scrubVideoWrappersData = [];
  
      this.scrubVideoWrappers.forEach((wrapper, index) => {
        // Attach observer
        observer.observe(wrapper.querySelector(".scrub-video-container"));
  
        // Give numerical index
        wrapper.setAttribute("data-scrub-video-index", index);
        
        // Store reference to video DOM element
        const video = wrapper.querySelector("video");
        this.scrubVideoWrappersData[index] = {
          video: video
        };
  
        // Force load video
        this.fetchVideo(video);
        
      });
  
      // Store positions of all the wrapper elements
      this.updateWrapperPositions();
  
  
      document.addEventListener("scroll", (event) => {
        this.handleScrollEvent(event);
      });
      window.addEventListener("resize", () => {
        this.updateWrapperPositions();
      });
    }
    
    fetchVideo(videoElement) {
      const src = videoElement.getAttribute("src");
      
      // Get the video
      fetch(src)
        .then((response) => response.blob())
        .then((response) => {
          // Create a data url containing the video raw data
          const objectURL = URL.createObjectURL(response);
        
          // Attach the 
          videoElement.setAttribute("src", objectURL);
          console.log("Finished loading " + src);
        });
    }
  
    updateWrapperPositions() {
      // Get new positions of video wrappers
      this.scrubVideoWrappers.forEach((wrapper, index) => {
        const clientRect = wrapper.getBoundingClientRect();
        const top = clientRect.y + window.scrollY;
        const bottom = clientRect.bottom - window.innerHeight + window.scrollY;
  
        this.scrubVideoWrappersData[index].top = top;
        this.scrubVideoWrappersData[index].bottom = bottom;      
      });
    }
  
    intersectionObserverCallback(entries, observer) {
      entries.forEach((entry) => {
        const isWithinViewport = entry.intersectionRatio === 1;
        // Add class 'in-view' to element if
        // it is within the viewport
        entry.target.classList.toggle("in-view", isWithinViewport);
  
        if (isWithinViewport) {
          observer.context.activeVideoWrapper = entry.target.parentNode.getAttribute(
            "data-scrub-video-index"
          );
        } else {
          observer.context.activeVideoWrapper = null;
        }
      });
    }
  
    handleScrollEvent = function (event) {
      // Is there are currently active video wrapper?
      if (this.activeVideoWrapper) {
        const activeWrapperData = this.scrubVideoWrappersData[
          this.activeVideoWrapper
        ];
        const top = activeWrapperData.top;
        const bottom = activeWrapperData.bottom;
        const video = activeWrapperData.video;
        const progress = Math.max(Math.min((window.scrollY - top) / (bottom - top), 0.998), 0) / 2;
        const seekTime = progress * video.duration;
  
        // console.log(`${lower} > ${window.scrollY} (${progress}) [${seekTime}]  > ${upper}`);
  
        video.currentTime = seekTime;
      }
    };
  }