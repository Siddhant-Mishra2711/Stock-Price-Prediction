import React,{useRef,useEffect, useState} from 'react'
import { createChart, ColorType, CrosshairMode , LineStyle } from 'lightweight-charts';
import axios from 'axios'
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import Prediction from './Prediction';

// eslint-disable-next-line react/prop-types
const Char = ({past,name,month}) => {
    const [open, setOpen] = useState(false);

    const onOpenModal = () => setOpen(true);
    const onCloseModal = () => setOpen(false);

    const [width, setWidth] = React.useState(0);
    const [loader, setloader] = React.useState(false);
    const chartContainerRef=useRef();
    const chartContainerRef2=useRef();
    const [candle, setCandle] = React.useState(-1)
    const [line, setLine] = React.useState(-1)
    const [area, setArea] = React.useState(-1)
    const [histogram, setHistogram] = React.useState(-1)
    const [bar, setBar] = React.useState(-1)
    const [baseline, setBaseline] = React.useState(-1)
    const [alldata, setallData] = React.useState([])
    const [average, setAverage] = React.useState(0)
    const [semidata, setSemidata] = React.useState([])
    const [state, setState] = React.useState(0)
    const [col,setcol]=React.useState(0)
    const [Indi,setIndi]=React.useState('SMA');
    const [indis,setindis]=React.useState([])
    const changecol=(e)=>{
        setcol(e.target.value)
    }
    React.useEffect(() => {
        //IF WINDOW SIZE IS OF LAPTOP THEN WIDTH IS 1380 ELSE IT WILL BE LOWER ACC TO MOBILE
        if(window.innerWidth>1024){
            
            setWidth(1380)
            chartContainerRef.current.innerHTML = '';
            chartContainerRef2.current.innerHTML = '';
            renderChart();
        }
        else{
            setWidth(580)
            chartContainerRef.current.innerHTML = '';
            chartContainerRef2.current.innerHTML = '';
            renderChart();
        }
    }, [window.innerWidth]);
    const indicator = [
        {name: 'Smoothed Moving Average', value: 'SMA'},
        {name: 'Exponential Moving Average', value: 'EMA'},
        {name: 'Relative Strength Index', value: 'RSI'},
        {name: 'Moving Average Convergence Divergence', value: 'MACD'},
        {name: 'Bollinger Bands', value: 'BB'},
        {name: 'Stochastic Oscillator', value: 'SO'},
        {name: 'Average True Range', value: 'ATR'},
        {name: 'Ichimoku Cloud', value: 'IC'},
        {name: 'Volume Weighted Average Price', value: 'VWAP'},
        {name: 'Money Flow Index', value: 'MFI'},
    ]
    const [arr,setarr]=React.useState([])
    function generateRandomColor() {
        // Generate a random hex color code
        const colorCode = Math.floor(Math.random()*16777215).toString(16);
        
        // Ensure the color code has 6 digits
        return "#" + "0".repeat(6 - colorCode.length) + colorCode;
      }
    const getCloseAvg=async()=>{
        console.log(month)
        let months=Number(month)+Number(Math.ceil(col/22))
        console.log(months)
        let namee=name
        const response = await axios.get('http://localhost:5000/api/ml2', {params: {name: namee, month: months}})
        let total=await response.data.data;
        console.log(total)
        let s=0;
        for(let i=0;i<total.length;i++){
            // eslint-disable-next-line react/prop-types
            if(total[i].Date===past[0].Date){
                s=Number(i);
                console.log(i)
                break;
            }
        }
        let end=Number(s);
        s-=Number(col);
        let sum=Number(0);
        let cnt=0;
        for(let i=s;i<=end;i++){
            cnt++;
            sum+=Number(total[i].Close);
        }
        console.log(sum)
        let newd=[];
        let colour=generateRandomColor();
        console.log(Number(s)+Number(col)+Number(semidata.length))
        for(let i=0;i<semidata.length;i++){
            console.log(sum)
            newd.push({time:semidata[i].time,value:(Number(sum)/Number(cnt))})
            sum-=Number(total[Number(s)].Close);
            // console.log(total[s].Close)
            sum+=Number(total[Number(s)+Number(col)].Close);
            
            s=Number(s)+1;
        }

        setarr([...arr,{check:1, data:newd, color:colour, day:col, type:"Close"}]);
      }

      const getOpenAvg=async()=>{
        console.log(month)
        let months=Number(month)+Number(Math.ceil(col/22))
        console.log(months)
        let namee=name
        const response = await axios.get('http://localhost:5000/api/ml2', {params: {name: namee, month: months}})
        let total=await response.data.data;
        console.log(total)
        let s=0;
        for(let i=0;i<total.length;i++){
            // eslint-disable-next-line react/prop-types
            if(total[i].Date===past[0].Date){
                s=Number(i);
                console.log(i)
                break;
            }
        }
        let end=Number(s);
        s-=Number(col);
        let sum=Number(0);
        let cnt=0;
        for(let i=s;i<=end;i++){
            cnt++;
            sum+=Number(total[i].Close);
        }
        console.log(sum)
        let newd=[];
        let colour=generateRandomColor();
        console.log(Number(s)+Number(col)+Number(semidata.length))
        for(let i=0;i<semidata.length;i++){
            console.log(sum)
            newd.push({time:semidata[i].time,value:(Number(sum)/Number(cnt))})
            sum-=Number(total[Number(s)].Open);
            // console.log(total[s].Close)
            sum+=Number(total[Number(s)+Number(col)].Open);
            
            s=Number(s)+1;
        }

        setarr([...arr,{check:1, data:newd, color:colour, day:col, type:"Open"}]);
      }

      const getHighAvg=async()=>{
        console.log(month)
        let months=Number(month)+Number(Math.ceil(col/22))
        console.log(months)
        let namee=name
        const response = await axios.get('http://localhost:5000/api/ml2', {params: {name: namee, month: months}})
        let total=await response.data.data;
        console.log(total)
        let s=0;
        for(let i=0;i<total.length;i++){
            // eslint-disable-next-line react/prop-types
            if(total[i].Date===past[0].Date){
                s=Number(i);
                console.log(i)
                break;
            }
        }
        let end=Number(s);
        s-=Number(col);
        let sum=Number(0);
        let cnt=0;
        for(let i=s;i<=end;i++){
            cnt++;
            sum+=Number(total[i].Close);
        }
        console.log(sum)
        let newd=[];
        let colour=generateRandomColor();
        console.log(Number(s)+Number(col)+Number(semidata.length))
        for(let i=0;i<semidata.length;i++){
            console.log(sum)
            newd.push({time:semidata[i].time,value:(Number(sum)/Number(cnt))})
            sum-=Number(total[Number(s)].High);
            // console.log(total[s].Close)
            sum+=Number(total[Number(s)+Number(col)].High);
            
            s=Number(s)+1;
        }

        setarr([...arr,{check:1, data:newd, color:colour, day:col, type:"High"}]);
      }

      const getLowAvg=async()=>{
        console.log(month)
        let months=Number(month)+Number(Math.ceil(col/22))
        console.log(months)
        let namee=name
        const response = await axios.get('http://localhost:5000/api/ml2', {params: {name: namee, month: months}})
        let total=await response.data.data;
        console.log(total)
        let s=0;
        for(let i=0;i<total.length;i++){
            // eslint-disable-next-line react/prop-types
            if(total[i].Date===past[0].Date){
                s=Number(i);
                console.log(i)
                break;
            }
        }
        let end=Number(s);
        s-=Number(col);
        let sum=Number(0);
        let cnt=0;
        for(let i=s;i<=end;i++){
            cnt++;
            sum+=Number(total[i].Close);
        }
        console.log(sum)
        let newd=[];
        let colour=generateRandomColor();
        console.log(Number(s)+Number(col)+Number(semidata.length))
        for(let i=0;i<semidata.length;i++){
            console.log(sum)
            newd.push({time:semidata[i].time,value:(Number(sum)/Number(cnt))})
            sum-=Number(total[Number(s)].Low);
            // console.log(total[s].Close)
            sum+=Number(total[Number(s)+Number(col)].Low);
            
            s=Number(s)+1;
        }

        setarr([...arr,{check:1, data:newd, color:colour, day:col,type:"Low"}]);
      }
    useEffect(()=>{
        // eslint-disable-next-line react/prop-types
        if(past.length===0){
            setState(0)
        }
        else{
            
            let sum=0;
            let count=0;
            // eslint-disable-next-line react/prop-types
            let alldat=past.map((item)=>{
                sum+=item.Close;
                count++;
                // Create a new Date object from the input string
                var inputDate = new Date(item.Date);

                // Get the year, month, and day components
                var year = inputDate.getUTCFullYear();
                var month = String(inputDate.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based, so we add 1
                var day = String(inputDate.getUTCDate()).padStart(2, '0');

                // Create the yyyy-mm-dd format string
                var formattedDate = `${year}-${month}-${day}`;
            return {time:formattedDate,close:item.Close,open:item.Open,high:item.High,low:item.Low}});
            setallData(alldat)
            setAverage(sum/count)
            setSemidata(alldat.map((item)=>{
                return {time:item.time,value:item.close}
            }))
           
            
            setState(1)
    }
    
    },
 
    [past])
    
    const renderChart = () => {
        const chart = createChart(chartContainerRef.current, {
            layout: {
                type: ColorType.Solid,
                backgroundColor: 'black',
            } ,
            width:width,
            height:550
        });
        const chart2 = createChart(chartContainerRef2.current, {
            layout: {
                type: ColorType.Solid,
                backgroundColor: 'black',
            } ,
            width:width,
            height:250
        });
        if (candle>0) {
          const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
            wickUpColor: '#26a69a', wickDownColor: '#ef5350',
        });
          candlestickSeries.setData(alldata);
        }
    
        if (bar>0) {
          const barSeries = chart.addBarSeries({
            upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
            wickUpColor: '#26a69a', wickDownColor: '#ef5350',
            });
          
            barSeries.setData(alldata);
        }

        if(line>0){
            const lineSeries = chart.addLineSeries({ color: '#2962FF' });
            lineSeries.setData(semidata);
        }
        if(area>0){
            const areaSeries = chart.addAreaSeries({
                lineColor: '#2962FF',
                topColor: '#2962FF',
                bottomColor: 'rgba(41, 98, 255, 0.28)',
            });
            areaSeries.setData(semidata);
        }
        if(histogram>0){
            const histogramSeries = chart.addHistogramSeries({ color: '#2962FF', lineWidth: 2 });
            histogramSeries.setData(semidata);
        }
        if(baseline>0){
            const newSeries = chart.addBaselineSeries({ baseValue: { type: 'price', price: average }, 
            topLineColor: 'rgba( 38, 166, 154, 1)', 
            topFillColor1: 'rgba( 38, 166, 154, 0.28)', 
            topFillColor2: 'rgba( 38, 166, 154, 0.05)', 
            bottomLineColor: 'rgba( 239, 83, 80, 1)', 
            bottomFillColor1: 'rgba( 239, 83, 80, 0.05)', 
            bottomFillColor2: 'rgba( 239, 83, 80, 0.28)' 
            });
            newSeries.setData(semidata);
        }
        if(arr.length>0){
            for(let i=0;i<arr.length;i++){
                if(arr[i].check>0){
                    console.log(arr[i].data)
                    const newSeries = chart.addLineSeries({ color: arr[i].color });
                    newSeries.setData(arr[i].data);
                }
            }
        }
        if(indis.length>0){
            for(let i=0;i<indis.length;i++){
                if(indis[i].check>0){
                    if(indis[i].type==='MACD'){
                        
                        console.log(indis[i].data)
                        const MACD = chart2.addHistogramSeries({ color: indis[i].color, lineWidth: 2 });
                        MACD.setData(indis[i].data);
                        console.log(indis[i].signal)
                        const signal = chart2.addLineSeries({ color: 'red' });
                        signal.setData(indis[i].signal);

                    }
                    else if(indis[i].type==='VWAP'||indis[i].type==='SMA'||indis[i].type==='EMA'||indis[i].type==='IC'){
                        const newSeries = chart.addLineSeries({ color: indis[i].color });
                        newSeries.setData(indis[i].data);
                    }
                    else if(indis[i].type==='MFI'||indis[i].type==='RSI'||indis[i].type==='ATR'){
                        const newSeries = chart2.addLineSeries({ color: indis[i].color });
                        newSeries.setData(indis[i].data);
                    }
                    else if(indis[i].type==='SO'){
                        const K = chart2.addLineSeries({ color: 'red' });
                        K.setData(indis[i].K);
                        const D = chart2.addLineSeries({ color: 'blue' });
                        D.setData(indis[i].D);
                    }
                    else if(indis[i].type==='BB'){
                        const upper = chart.addLineSeries({ color: 'red' });
                        upper.setData(indis[i].upper);
                        const lower = chart.addLineSeries({ color: 'blue' });
                        lower.setData(indis[i].lower);
                    }

                }
            }
        }
        chart.applyOptions({
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: {
                    width: 8,
                    color: '#C3BCDB44',
                    style: LineStyle.Solid,
                    labelBackgroundColor: '#9B7DFF',
                },
                horzLine: {
                    color: '#9B7DFF',
                    labelBackgroundColor: '#9B7DFF',
                },
            },
        });
        
      chart.timeScale().applyOptions({
        barSpacing: 10,
      });
      };
    
      useEffect(() => {
        if (chartContainerRef.current) {
          // Clear the container before re-rendering
          chartContainerRef.current.innerHTML = '';
            chartContainerRef2.current.innerHTML = '';
          renderChart();
        }
        
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [candle, line,area,histogram,bar,baseline,past,arr,indis]);
    

    const changestate=(index)=>{
        let newarr=arr;
        newarr[index].check=newarr[index].check*-1;
        setarr(newarr);
        if (chartContainerRef.current) {
            // Clear the container before re-rendering
            chartContainerRef.current.innerHTML = '';
            chartContainerRef2.current.innerHTML = '';
            renderChart();
          }
    }
    const changestate2=(index)=>{
        let newarr=indis;
        newarr[index].check=newarr[index].check*-1;
        setindis(newarr);
        if (chartContainerRef.current) {
            // Clear the container before re-rendering
            chartContainerRef.current.innerHTML = '';
            chartContainerRef2.current.innerHTML = '';
            renderChart();
        }
    }

    const [movavgopt, setmovavgopt] = React.useState('Close')
    const changemovavg=(e)=>{
        setmovavgopt(e.target.value)
    }
    const getAvg=()=>{
        if(movavgopt==="Close"){
            getCloseAvg();
        }
        else if(movavgopt==="Open"){
            getOpenAvg();
        }
        else if(movavgopt==="High"){
            getHighAvg();
        }
        else if(movavgopt==="Low"){
            getLowAvg();
        }
    }
    
    const newReq=async()=>{
        var indRes=await axios.get('http://localhost:5000/api/indicator', {params: {name: name, month: month, indicator: Indi}})
        
        console.log(indRes);
        let newd=[];
        let colour=generateRandomColor();
        
        if(Indi==='MACD'){
            let signal=[];
            for(let i=0;i<indRes.data.data.length;i++){
                // Create a new Date object from the input string
                let inputDate = new Date(indRes.data.data[i].Date);
                
                if(Number.isNaN(indRes.data.data[i].Signal))
                    continue;
                // Get the year, month, and day components
                let year = inputDate.getUTCFullYear();
                let month = String(inputDate.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based, so we add 1
                let day = String(inputDate.getUTCDate()).padStart(2, '0');
        
                // Create the yyyy-mm-dd format string
                let formattedDate = `${year}-${month}-${day}`;
                signal.push({time:formattedDate,value:indRes.data.data[i].Signal})
                newd.push({time:formattedDate,value:indRes.data.data[i].MACD})
            }
            setindis([...indis,{check:1, data:newd, signal:signal,type:Indi,color:colour, day:0}]);
        }
        else if(Indi==='RSI'||Indi==='ATR'||Indi==='VWAP'||Indi==='MFI'||Indi==='SMA'||Indi==='EMA'||Indi==='IC'){
            for(let i=0;i<indRes.data.data.length;i++){
                // Create a new Date object from the input string
                let inputDate = new Date(indRes.data.data[i].Date);

                if(Number.isNaN(indRes.data.data[i][Indi]))
                    continue;
                // Get the year, month, and day components
                let year = inputDate.getUTCFullYear();
                let month = String(inputDate.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based, so we add 1
                let day = String(inputDate.getUTCDate()).padStart(2, '0');

                // Create the yyyy-mm-dd format string
                let formattedDate = `${year}-${month}-${day}`;
                newd.push({time:formattedDate,value:indRes.data.data[i][Indi]})
            }
            setindis([...indis,{check:1, data:newd, type:Indi,color:colour, day:0}]);
        }
        else if(Indi==='SO'){
            let D=[];
            for(let i=0;i<indRes.data.data.length;i++){
                // Create a new Date object from the input string
                let inputDate = new Date(indRes.data.data[i].Date);
                
                if(Number.isNaN(indRes.data.data[i].K))
                    continue;
                // Get the year, month, and day components
                let year = inputDate.getUTCFullYear();
                let month = String(inputDate.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based, so we add 1
                let day = String(inputDate.getUTCDate()).padStart(2, '0');

                // Create the yyyy-mm-dd format string
                let formattedDate = `${year}-${month}-${day}`;
                newd.push({time:formattedDate,value:indRes.data.data[i].K})
                D.push({time:formattedDate,value:indRes.data.data[i].D})
            }
            setindis([...indis,{check:1, K:newd, D:D,type:Indi,color:colour, day:0}]);
        }
        else if(Indi==='BB'){
            let upper=[];
            let lower=[];
            for(let i=0;i<indRes.data.data.length;i++){
                // Create a new Date object from the input string
                let inputDate = new Date(indRes.data.data[i].Date);

                if(Number.isNaN(indRes.data.data[i].Upper))
                    continue;

                // Get the year, month, and day components
                let year = inputDate.getUTCFullYear();
                let month = String(inputDate.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based, so we add 1
                let day = String(inputDate.getUTCDate()).padStart(2, '0');

                // Create the yyyy-mm-dd format string
                let formattedDate = `${year}-${month}-${day}`;
                upper.push({time:formattedDate,value:indRes.data.data[i].Upper})
                lower.push({time:formattedDate,value:indRes.data.data[i].Lower})
            }
            setindis([...indis,{check:1, upper:upper, lower:lower,type:Indi,color:colour, day:0}]);
        }
    }
    const [prediction, setPrediction] = React.useState(null)
    const getPrediction=async()=>{
        onOpenModal();
        setloader(true);
        console.log("BEFORE PREDICTION",name,month)
        const res= await fetch('http://localhost:5000/api/prediction?name='+name+'&month='+month)
        console.log("PREDICTION1",res)
        const data=await res.json()
        console.log("PREDICTION2",data)
        setPrediction(data)
        setloader(false);
    }
  return (
    <>
  {state === 0 ? null : (
    <div className="flex flex-col gap-8 p-6 mb-10 mr-4 bg-gradient-to-br from-blue-100 via-indigo-200 to-purple-100 rounded-2xl shadow-xl border border-gray-300">

      {/* Chart Type Buttons */}
      <div className="flex flex-wrap gap-4">
        {[
          { state: candle, setter: setCandle, label: 'Candle' },
          { state: line, setter: setLine, label: 'Line' },
          { state: area, setter: setArea, label: 'Area' },
          { state: histogram, setter: setHistogram, label: 'Histogram' },
          { state: bar, setter: setBar, label: 'Bar' },
          { state: baseline, setter: setBaseline, label: 'Baseline' }
        ].map(({ state, setter, label }) => (
          <button
  key={label}
  onClick={() => setter(state * -1)}
  className={`px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 border shadow-md ${
    state > 0
      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:brightness-110'
      : 'bg-gradient-to-r from-zinc-200 to-zinc-300 text-zinc-800 hover:brightness-105 border-gray-300'
  }`}
>
  {label}
</button>

        ))}
      </div>

      {/* Modal */}
      <Modal
        open={open}
        onClose={onCloseModal}
        center
        classNames={{
          overlay: 'customOverlay',
          modal: 'customModal',
        }}
      >
        <div className="flex flex-col items-center gap-4 p-6 text-white bg-zinc-900 rounded-lg shadow-lg">
          {loader ? (
            <>
              <h1 className="text-2xl font-bold">Loading...</h1>
              <img src="https://i.gifer.com/ZZ5H.gif" alt="loading" />
            </>
          ) : (
            prediction && (
              <Prediction
                currentPrice={prediction.edp}
                predictedPrice={prediction.ndp}
                priceChange={prediction.ndp - prediction.edp}
                perc={(Math.abs(prediction.ndp - prediction.edp) * 100) / prediction.edp}
              />
            )
          )}
        </div>
      </Modal>

      {/* Moving Average Input */}
<div className="flex flex-col sm:flex-row flex-wrap gap-4">
  <input
    type="number"
    placeholder="Enter moving average in days"
    onChange={changecol}
    className="px-5 py-3 rounded-xl bg-gradient-to-br from-zinc-200 to-zinc-100 text-zinc-800 border border-gray-300 focus:ring-2 focus:ring-cyan-500 outline-none w-full sm:w-64 shadow-inner placeholder:text-zinc-500"
  />

  <select
    value={movavgopt}
    onChange={changemovavg}
    className="px-5 py-3 rounded-xl bg-gradient-to-br from-zinc-200 to-zinc-100 text-zinc-800 border border-gray-300 focus:ring-2 focus:ring-cyan-500 w-full sm:w-52 shadow-inner"
  >
    <option value="Close">Close</option>
    <option value="Open">Open</option>
    <option value="High">High</option>
    <option value="Low">Low</option>
  </select>

  <button
    onClick={getAvg}
    className="w-full sm:w-48 px-6 py-3 flex items-center justify-center gap-2 
               rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 
               hover:from-cyan-400 hover:to-emerald-600 
               transition-all duration-300 text-white font-semibold shadow-lg hover:scale-105"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.8"
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16m-7-7l7 7-7 7" />
    </svg>
    Get Data
  </button>
</div>

{/* Indicator Select */}
<div className="flex flex-wrap items-center gap-4 mt-4">
  <select
    onChange={(e) => setIndi(e.target.value)}
    className="px-5 py-3 rounded-xl bg-gradient-to-br from-zinc-200 to-zinc-100 text-zinc-800 border border-gray-300 focus:ring-2 focus:ring-emerald-500 w-full sm:w-64 shadow-inner"
  >
    {indicator.map((item, index) => (
      <option key={index} value={item.value}>
        {item.name}
      </option>
    ))}
  </select>

  <button
    onClick={newReq}
    className="px-6 py-3 rounded-xl bg-gradient-to-tr from-emerald-500 to-lime-500 
               hover:from-emerald-400 hover:to-lime-600 
               transition-all duration-300 text-white font-semibold shadow-lg hover:scale-105 w-full sm:w-48"
  >
    Get Indicator
  </button>
</div>

{/* Moving Average Buttons */}
{arr.length > 0 && (
  <div className="flex flex-wrap gap-3 mt-4">
    {arr.map((item, index) => (
      <button
  className={`px-4 py-2 rounded-lg font-medium text-sm shadow-md transition-all duration-300 ${
    item.check > 0
      ? 'bg-gradient-to-r from-yellow-200 to-yellow-400 text-zinc-900'
      : 'bg-zinc-800 text-white hover:bg-zinc-700'
  }`}
>
  {item.day} day [{item.type}] MA
</button>
    ))}
  </div>
)}

{/* Prediction Button */}
<div className="flex justify-center mt-6">
  <button
    onClick={getPrediction}
    className="w-full sm:w-64 px-6 py-3 flex items-center justify-center gap-2 
               rounded-xl bg-gradient-to-tr from-fuchsia-500 via-purple-600 to-indigo-600 
               hover:from-purple-500 hover:to-indigo-700 
               transition-all duration-300 text-white font-bold text-base 
               shadow-lg hover:scale-105"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6l4 2m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    Predict Now
  </button>
</div>



      {/* Indicator Results Buttons */}
      {indis.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {indis.map((item, index) => (
            <button
              key={index}
              onClick={() => changestate2(index)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md"
              style={
                item.check > 0
                  ? { background: item.color, color: 'black' }
                  : { background: 'black', color: 'white' }
              }
            >
              {item.type}
            </button>
          ))}
        </div>
      )}
    </div>
  )}
  <div ref={chartContainerRef}></div>
  <div ref={chartContainerRef2}></div>
</>


  )
}

export default Char