'use client'

import Image from 'next/image'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useChat } from 'ai/react'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

import character01 from './images/character01.png'
import close from './images/close.png'
import logo from './images/logo.png'
import arrowRight from './images/arrow-right.png'
import background from "./images/background.png";
import linkFile from "./images/link.png";
import submit from "./images/send.png";
import fullScreenRevert from "./images/full-screen-revert.png";
import fullScreen from "./images/full-screen.png";

export default function Chat() {

  const [chatBotVisible, setChatBotVisible] = useState<number>(0);
  const [aiImageUrls, setAiImageUrls] = useState<string[]>([])

  const firstQuestions = [
    {
      id: 1,
      content: "What’s this?"
    },
    {
      id: 2,
      content: "What services do you offer?"
    },
    {
      id: 3,
      content: "What’s new?"
    },
    {
      id: 4,
      content: "What’s is the solution?"
    },
  ]

  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  }

  const swiperRef = useRef<any | null>(null);

  const handleSwiper = (swiper: any) => {
    swiperRef.current = swiper;
    if (swiperRef.current) {
      swiperRef.current.slideTo(messages.length, 0);
    }
  };

  const { data, messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat-with-vision',
  })

  type DataItem = {
    text: string;
    // Add any other properties if present
  };

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(messages.length, 0);
    }
    const urls = (data as DataItem[])?.map((item: DataItem) => item?.text);
    if (urls && urls.length > 0)
      setAiImageUrls(urls)
  }, [messages]);

  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [base64Images, setBase64Images] = useState<string[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileButtonClick = () => {
    fileInputRef.current?.click() // ボタンクリックで隠しファイル入力をトリガー
  }

  const toggleChatBot = (id: number) => {
    setChatBotVisible(id);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)

      // 新しく選択されたファイルのURLを生成し、既存のURLに追加
      const newURLs = newFiles.map((file) => URL.createObjectURL(file))
      setImageUrls((prevURLs) => [...prevURLs, ...newURLs])

      // 新しく選択されたファイルをBase64にエンコードし、既存のBase64データに追加
      const base64Promises = newFiles.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader()

          reader.onload = (e: ProgressEvent<FileReader>) => {
            if (e.target && e.target.result) {
              resolve(e.target.result as string)
            }
          }

          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      })

      // すべてのBase64エンコードが完了したら状態を更新
      Promise.all(base64Promises).then((newBase64Images) => {
        setBase64Images((prevBase64Images) => [
          ...prevBase64Images,
          ...newBase64Images,
        ])
      })
    }
  }

  const handleRemoveFile = (index: number) => {
    setImageUrls((prevFileURLs) =>
      prevFileURLs.filter((_, fileIndex) => fileIndex !== index),
    )
    setBase64Images((prevBase64Images) =>
      prevBase64Images.filter((_, fileIndex) => fileIndex !== index),
    )
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const FilePreview = () =>
    imageUrls.length > 0 ? (
      <div className="flex space-x-2 px-[15px] bg-[#fff] border-t-[1px] border-t-[#C0C0C0] py-[20px]">
        {imageUrls.map((imageUrl, index) => (
          <Fragment key={index}>
            <div className="w-[40px]">
              <Image
                src={imageUrl}
                alt="File preview"
                width={50}
                height={50}
                className="rounded"
              />
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="text-xs text-center mx-auto"
              >
                Delete
              </button>
            </div>
          </Fragment>
        ))}
      </div>
    ) : null

  return (
    <>
      {chatBotVisible === 0 ? (
        <div className='w-[70px] h-[70px] absolute right-[50px] bottom-[50px] cursor-pointer' onClick={() => toggleChatBot(1)}>
          <Image
            src={character01}
            width={70}
            height={70}
            alt="Custom Chatbot Character"
          />
        </div>
      ) : (
        <>
          {chatBotVisible === 1 ? (
            <div className="fixed right-[50px] bottom-[50px]">
              <div className="w-[400px] bg-[#08DA83] rounded-[20px] relative shadow-md">
                <div className="w-[30px] h-[30px] absolute top-[15px] right-[15px] cursor-pointer" onClick={() => toggleChatBot(0)}>
                  <Image src={close} alt='Close' />
                </div>
                <div className="h-[232px] flex justify-center items-center flex-col gap-[20px]">
                  <div className="w-[80px] h-[80px]">
                    <Image src={logo} alt="" />
                  </div>
                  <h2 className="text-[#fff] text-[20px]">ChatBotSupport</h2>
                </div>
                <div className="bg-[#fff] rounded-[20px]">
                  <div className="px-[20px] py-[15px]">
                    <p>Hello, customer!<br />Please select your first question.</p>
                  </div>
                  {firstQuestions.map((item) => (
                    <div key={item.id} className="px-[20px] py-[15px] flex justify-between items-center border-t-[1px] border-t-[#DBDBDB] cursor-pointer" onClick={() => toggleChatBot(2)}>
                      <p>{item.content}</p>
                      <div className="w-[20px] h-[20px]">
                        <Image src={arrowRight} alt="arrow right icon" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className={`${isFullScreen ? "w-full" : "fixed bottom-[50px] right-[50px]"}`}>
              <div className={`${isFullScreen ? "w-full h-[100vh] relative bg-[#08DA83]" : "w-[400px] bg-[#08DA83] rounded-[20px] relative shadow-md"}`}>
                <div className="w-[25px] h-[25px] absolute top-[15px] right-[15px] cursor-pointer" onClick={() => toggleChatBot(0)}>
                  <Image src={close} alt='Close' />
                </div>
                <div className="w-[25px] h-[25px] absolute top-[15px] right-[50px] cursor-pointer" onClick={toggleFullScreen}>
                  {isFullScreen === true ? (
                    <Image src={fullScreenRevert} alt="Full Screen Revert Mode" />
                  ) : (
                    <Image src={fullScreen} alt="Full Screen Mode" />
                  )}
                </div>
                <div className="flex justify-start items-center px-[15px] py-[20px] gap-[10px]">
                  <div className="w-[50px] h-[50px]">
                    <Image src={logo} alt="Logo"></Image>
                  </div>
                  <h2 className="text-[#fff] text-[20px]">ChatBot Support</h2>
                </div>
                <div className={`${isFullScreen ? "bg-[#fff] py-[20px] px-[15px] w-full rounded-t-[20px] h-[calc(100vh_-_166px)] bg-cover overflow-y-auto" : "bg-[#fff] py-[20px] px-[15px] w-full rounded-t-[20px] h-[364px] bg-cover overflow-y-auto"}`} style={{ backgroundImage: `url(${background.src})`, }}>
                  <Swiper
                    direction={'vertical'}
                    slidesPerView={1}
                    spaceBetween={30}
                    mousewheel={true}
                    modules={[Mousewheel]}
                    className="mySwiper"
                  >
                    {messages.length > 0
                      ? messages.map((m) => (
                        <Fragment key={m.id}>
                          {m.role === "user" ? (
                            <SwiperSlide >
                              <p className={`p-[10px] w-fit mb-[10px] text-[16px] ${m.role === "user" ? "bg-[#08DA83] ml-auto rounded-s-[10px] rounded-t-[10px] text-[#fff]" : "bg-[#DBDBDB] rounded-e-[10px] rounded-t-[10px] text-left"}`}>
                                {m.content}
                              </p>
                            </SwiperSlide>
                          ) : (
                            <></>
                          )}
                          {aiImageUrls.map((url: any, index: any) => (
                            <SwiperSlide key={index}>
                              <img src={url} alt={`Image ${index}`} height={100} width={100} />
                            </SwiperSlide>
                          ))}

                        </Fragment>
                      ))
                      : null}
                  </Swiper>
                </div>
                <div className={`${isFullScreen ? "w-full" : "mx-auto max-w-lg w-full"}`}>
                  <div className="rounded border-gray-700">
                    <FilePreview />
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleSubmit(e, {
                          data: {
                            base64Images: JSON.stringify(base64Images),
                          },
                        })
                      }}
                      className={`flex items-center justify-center px-[20px] gap-[10px] py-[19px] bg-[#fff] border-[1px] border-t-[#C0C0C0] ${isFullScreen ? "" : "rounded-b-[20px]"}`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        multiple
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={handleFileButtonClick}
                        className="w-[20px] h-[20px]"
                      >
                        <Image src={linkFile} alt="Link File" />
                      </button>
                      <input
                        className="w-full rounded outline-none border p-[5px]"
                        value={input}
                        placeholder="Type your message ..."
                        onChange={handleInputChange}
                      />
                      <button
                        type="submit"
                        className="w-[20px] h-[20px]"
                      >
                        <Image src={submit} alt="Link File" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}
