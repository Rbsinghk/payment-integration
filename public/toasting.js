/*! toasting v0.1 | MIT License | https://github.com/tharith-p/toasting */
(function (root, factory) {
  try {
    if (typeof exports === "object") {
      module.exports = factory();
    } else {
      root.toasting = factory();
    }
  } catch (error) {
    console.log(
      "Isomorphic compatibility is not supported at this time for toasting."
    );
  }
})(this, function () {
  if (document.readyState === "complete") {
    init();
  } else {
    window.addEventListener("DOMContentLoaded", init);
  }
  toasting = {
    create: function () {
      console.error(
        [
          "DOM has not finished loading.",
          "\tInvoke create method when DOMs readyState is complete",
        ].join("\n")
      );
    },
  };
  let Timer = function (callback, delay) {
    let timerId,
      start,
      remaining = delay;
    this.pause = function () {
      window.clearTimeout(timerId);
      timerId = null;
      remaining -= Date.now() - start;
    };
    this.resume = function () {
      if (timerId) {
        return;
      }
      start = Date.now();
      timerId = window.setTimeout(callback, remaining);
    };
    this.resume();
  };
  let getClassName = (name) => {
    var prefix = "tg";
    var seperater = "-";
    return prefix + seperater + name;
  };
  let dfIsHoverToPause = true;
  let dfTimeout = 4e3;
  let dfTitle = "Default Title";
  let dfType = "default";
  let dfAutoHide = true;
  let dfHideProgressBar = false;
  let dfProgressBarType = "";
  function init() {
    let container = document.createElement("div");
    container.id = getClassName("container");
    document.body.appendChild(container);
    toasting.create = function (options) {
      this.create.previousState = (this.create.previousState ?? 0) + 1;
      let timer = undefined;
      let isHoverToPause =
          options.isHoverToPause !== undefined
            ? options.isHoverToPause
            : dfIsHoverToPause,
        timeout = options.timeout !== undefined ? options.timeout : dfTimeout,
        title = options.title !== undefined ? options.title : dfTitle,
        type = options.type !== undefined ? options.type : dfType,
        autoHide =
          options.autoHide !== undefined ? options.autoHide : dfAutoHide,
        hideProgressBar =
          options.hideProgressBar != undefined
            ? options.hideProgressBar
            : dfHideProgressBar,
        progressBarType =
          options.progressBarType != undefined
            ? options.progressBarType
            : dfProgressBarType,
        onHide = new Event("onHide"),
        onHidden = new Event("onHidden");
      let toasting = document.createElement("div");
      toasting.id = `toast-${this.create.previousState}`;
      toasting.classList.add(getClassName("toast"));
      isHoverToPause && toasting.classList.add("hover:pause");
      let wrapper = document.createElement("div");
      let h4 = document.createElement("h4");
      h4.className = getClassName("title");
      h4.innerHTML = title;
      wrapper.appendChild(h4);
      if (options.text) {
        let p = document.createElement("p");
        p.className = getClassName("text");
        p.innerHTML = options.text;
        wrapper.appendChild(p);
      }
      if (options.icon) {
        wrapper.classList += " img";
        let img = document.createElement("img");
        img.src = options.icon;
        img.className = getClassName("icon");
        wrapper.appendChild(img);
      }
      if (!hideProgressBar) {
        let cssAnimation = document.createElement("style");
        cssAnimation.id = `style-${toasting.id}`;
        let rules = document.createTextNode(
          `\n                    @keyframes animate-${this.create.previousState} {\n                        0% {\n                            clip-path: inset(0px 0% 0px 0px);\n                        }\n                        100% {\n                            clip-path: inset(0px 100% 0px 0px);\n                        }\n                    }\n                `
        );
        cssAnimation.appendChild(rules);
        document.getElementsByTagName("head")[0].appendChild(cssAnimation);
        let progressBar = document.createElement("div");
        progressBar.classList.add("progress-bar");
        progressBar.style.animationName = `animate-${this.create.previousState}`;
        progressBar.style.animationDuration = `${timeout / 1e3}s`;
        progressBar.style.animationTimingFunction = "linear";
        progressBar.style.animationFillMode = "forwards";
        progressBarType != "" && progressBar.classList.add(progressBarType);
        wrapper.appendChild(progressBar);
      }
      if (typeof options.callback === "function") {
        toasting.addEventListener("click", options.callback);
      }
      if (isHoverToPause) {
        toasting.addEventListener("mouseenter", (e) => {
          timer != undefined && timer.pause();
        });
        toasting.addEventListener("mouseleave", (e) => {
          timer != undefined && timer.resume();
        });
      }
      toasting.isShowing = true;
      toasting.hide = () => {
        toasting.dispatchEvent(onHide);
        toasting.classList.add(getClassName("fadeOut"));
        toasting.addEventListener("animationend", removeToast, false);
        return null;
      };
      if (autoHide) {
        if (isHoverToPause) {
          timer = new Timer(toasting.hide, timeout + 200);
        } else {
          setTimeout(toasting.hide, timeout + 200);
        }
      }
      wrapper.classList.add(getClassName(type));
      toasting.addEventListener("click", toasting.hide);
      function removeToast() {
        document
          .getElementById(getClassName("container"))
          .removeChild(toasting);
        let style = document.querySelector(`#style-${toasting.id}`);
        if (style) {
          style.remove();
        }
        toasting.dispatchEvent(onHidden);
        toasting.isShowing = false;
      }
      toasting.appendChild(wrapper);
      document.getElementById(getClassName("container")).appendChild(toasting);
      return toasting;
    };
  }
  return toasting;
});
