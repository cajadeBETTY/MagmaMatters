const canvasSketch = require('canvas-sketch');
const random = require ('canvas-sketch-util/random');
const math = require ('canvas-sketch-util/math');
const Tweakpane = require('tweakpane');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate:true
};

const params = {
  cols:25,
  rows:25,
  scaleMin:0.5,
  scaleMax:2.5,
  freq:0.002,
  amp:0.7,
  frame:0,
  animate: true,
  lineCap: 'round',
};


const sketch = () => {
  return ({ context, width, height,frame }) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

const cols = params.cols;
const rows = params.rows;
const numCells = cols*rows;

const gridw = width * 0.8;
const gridh = height * 0.8;
const cellw = gridw / cols;
const cellh = gridh / rows;

const margx= (width-gridw) * 0.5;
const margy= (height-gridh) * 0.5;



for ( let i =0; i< numCells;i++){

  const col = i % cols;
  const row = Math.floor( i / cols );

  const x = col*cellw;
  const y = row*cellh;

  const w= cellw*0.8;
  const h= cellh*0.8;

  const f=params.animate? frame: params.frame;

  //const n = random.noise2D(x+frame*5,y,params.freq);
  const n = random.noise3D(x,y,f*10,params.freq);

  const angle = n*Math.PI*params.amp;

  // const scale = (n+1)/2*15;
  //const scale=(n*0.5+0.5)*15;
  const scale = math.mapRange(n,-1,1,params.scaleMin,params.scaleMax);



  let myr=math.mapRange(n,-1,1,0,255);



  context.save();

    context.translate(x+(cellw*0.5)+margx,y+(cellh*0.5)+margy);
    context.rotate(angle);

    context.lineWidth=scale;
    context.lineCap=params.lineCap;
    context.strokeStyle = 'rgb('+myr.toString()+',200,250)';

    context.beginPath();
    context.lineTo(cellw,0);

    context.arc(0,0,w*0.15,0,2*Math.PI);

    context.stroke();

  context.restore();
}

  };
};

const createPane =() =>{
  const pane = new Tweakpane.Pane();
  let folder;

  folder = pane.addFolder({title:'Grid'});
  folder.addInput(params,'lineCap',{options:{butt:'butt',round:'round',square:'square'}});
  folder.addInput(params,'cols',{min:2, max:50,step:1});
  folder.addInput(params,'rows',{min:2, max:50,step:1});
  folder.addInput(params,'scaleMin',{min:0, max:10});
  folder.addInput(params,'scaleMax',{min:2, max:20});

  folder =pane.addFolder({title:'Noise'});
  folder.addInput(params,'freq',{min:-0.01,max:0.01 });
  folder.addInput(params,'amp',{min:0,max:1});

  folder.addInput(params, 'animate');
  folder.addInput(params,'frame',{min:0,max:999});

}

createPane();

canvasSketch(sketch, settings);
