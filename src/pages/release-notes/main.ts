const clickHereE = document.getElementsByClassName('click-here');
const exampleContainerE = document.getElementById('example-container');
const imageE = document.getElementById('example-img') as HTMLImageElement;
const closeE = document.getElementById('example-close')

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
