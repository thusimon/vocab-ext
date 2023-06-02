import { debounce } from "../../common/utils";

const clickHereE = document.getElementsByClassName('click-here');
const exampleContainerE = document.getElementById('example-container');
const imageE = document.getElementById('example-img') as HTMLImageElement;
const closeE = document.getElementById('example-close');
const tableE = document.getElementById('release-table');
const versionsE = document.getElementsByClassName('version');
const tableCellE = document.querySelector('table tr td');
const tableCellEPos = tableCellE.getBoundingClientRect();
const tableCellHeight = tableCellEPos.height;

const clickHereHander = (evt: MouseEvent) => {
  const target = evt.target as HTMLElement;
  const img = target.dataset.img;
  if(!img) {
    return;
  }
  imageE.src = `images/${img}.gif`;
  exampleContainerE.className = 'show';
}

for(const element of clickHereE){
  element.addEventListener('click', clickHereHander);
}

closeE.addEventListener('click', () => {
  exampleContainerE.className = 'hide';
});

const getLastVersionInView = () => {
  const tableRect = tableE.getBoundingClientRect();
  const tableY = tableRect.y;
  const firstVersionY = tableY + 42;
  const windowBottom = window.innerHeight + window.scrollY
  const currentMaxVersionIndex = Math.round((windowBottom - firstVersionY) / tableCellHeight);
  const currentVersionIndex = Math.min(versionsE.length, currentMaxVersionIndex - 1);
  console.log(currentVersionIndex);
}

getLastVersionInView();

window.addEventListener('scroll', debounce(() => {
  getLastVersionInView();
}, 500));

