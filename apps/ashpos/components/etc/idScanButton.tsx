"use client"

import { cn } from "@/lib/utils"
import { init } from "../../utils/dcv";
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { IoScanSharp } from "react-icons/io5"
import { HolderInfo } from "./scanner"

const Scanner = dynamic(() => import("./scanner"), {
    ssr: false,
    loading: () => <p>Initializing ID Card Scanner</p>,
});

export default function IDScannerButton() {

  const [isHovered, setIsHovered] = useState(false)
  const [scanning,setScanning] = useState(false);
  const [initialized,setInitialized] = useState(false);
  const [imageURL,setImageURL] = useState("");
  const [info,setInfo] = useState<HolderInfo|undefined>();
  
  const startScanning = () => {
    console.log("SStart scanning");
    setScanning(true);
  }
  
  const onScanned = (blob:Blob,_info?:HolderInfo) => {
    let url = URL.createObjectURL(blob);
    setImageURL(url);
    setInfo(_info);
    setScanning(false);
  }
  
  const onStopped = () => {
    setScanning(false);
  }

  useEffect(()=>{
    const initDynamsoft = async () => {
      try {
        const result = await init();
        if (result) {
          setInitialized(true);
        }
      } catch (error) {
        alert(error);
      }
    }
    initDynamsoft();
  },[]);


  return (
    <div className="relative w-full h-full ">
      <button
        className="abslute btn btn-outline-primary"
        onClick={startScanning}
      >
        <IoScanSharp className="mr-2"/>
        ID Scan
        {/* <div className="absolute inset-0 rounded bg-white/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" /> */}
      </button>
      {scanning && (
        <div className="fullscreen">
            <Scanner onScanned={onScanned} onStopped={onStopped}/>
        </div>
        )}
    </div>
  )
}