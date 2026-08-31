const frame=document.querySelector('#app');
frame?.addEventListener('load',()=>{
  const win=frame.contentWindow;
  if(!win||win.__a4PreventProbeInstalled)return;
  win.__a4PreventProbeInstalled=true;

  const eventProto=win.Event?.prototype;
  const inputProto=win.HTMLInputElement?.prototype;
  if(!eventProto||!inputProto)return;

  const originalPrevent=eventProto.preventDefault;
  eventProto.preventDefault=function(...args){
    try{
      if(this.target?.matches?.('[data-wt2-criterion],[data-sps-criterion]')){
        win.__a4PreventDefaultStack=new Error('A4 checkbox preventDefault call').stack||'';
      }
    }catch{}
    return originalPrevent.apply(this,args);
  };

  const originalClick=inputProto.click;
  inputProto.click=function(...args){
    const tracked=this.matches?.('[data-wt2-criterion],[data-sps-criterion]');
    if(tracked)win.__a4PreventDefaultStack='';
    const result=originalClick.apply(this,args);
    if(tracked&&!this.checked){
      const stack=win.__a4PreventDefaultStack||'No preventDefault stack captured.';
      throw new Error(`A4 checkbox click was cancelled.\n${stack}`);
    }
    return result;
  };
},{once:false});
