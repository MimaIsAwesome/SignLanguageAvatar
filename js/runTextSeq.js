const textInputSeq = document.getElementById("text-input");
const runButton = document.getElementById("btn-run");
let buttonState = "Run";
let isRunning = true;
let interval = [];
const buttons = Array.prototype.slice.call(
  document.getElementsByTagName("button")
);

const runTextSeq = () => {
  isRunning ? (buttonState = "Stop") : (buttonState = "Run");
  isRunning = !isRunning;
  runButton.innerHTML = "<h3>" + buttonState + "</h3>";

  clearBtns();
  buttons.forEach((btn) => {
    if (btn.id.length < 3) {
      btn.disabled = !btn.disabled;
    }
  });

  if (!isRunning) {
    let charsToRun = textInputSeq.value.toUpperCase().split("");
    console.log(charsToRun);

    charsToRun.forEach((char, index) => {
      let time = document.getElementById("checker").checked ? 700 : 3000;
      console.log(index * time + 1000);
      interval[index] = setTimeout(() => {
        updateRotation(char);
      }, index * time + 100);
    });
  } else {
    interval.forEach((int) => {
      console.log(int);
      clearInterval(int);
    });
    interval = [];
    textInputSeq.value = "";
  }
};
runButton.addEventListener("click", runTextSeq);

// clear buttons
const clearBtns = () => {
  buttons.forEach((btn) => {
    btn.setAttribute("style", "background: red, color: #333");
  });
};

export default runTextSeq;
