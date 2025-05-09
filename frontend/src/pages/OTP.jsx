import CodeInput from "../components/CodeInput";

const OTP = () => {
  return (
    <div className="w-full relative bg-[#fff] overflow-hidden flex flex-col items-start justify-start pt-[1.5rem] px-[23.562rem] pb-[18.062rem] box-border gap-[16.875rem] leading-[normal] tracking-[normal] text-left text-[2.25rem] text-[#40919e] font-oswald mq450:gap-[4.188rem] mq450:pl-[1.25rem] mq450:pr-[1.25rem] mq450:box-border mq750:gap-[8.438rem] mq750:pl-[11.75rem] mq750:pr-[11.75rem] mq750:box-border">
      <div className="self-stretch flex flex-row items-start justify-start py-[0rem] pl-[14.25rem] pr-[14.312rem] mq450:pl-[1.25rem] mq450:pr-[1.25rem] mq450:box-border mq750:pl-[7.125rem] mq750:pr-[7.125rem] mq750:box-border">
        <div className="flex-1 relative z-[1] mq450:text-[1.375rem] mq750:text-[1.813rem]">
          TOPPERS TRUST
        </div>
      </div>
      <main className="w-full h-full absolute !!m-[0 important] top-[0rem] right-[0rem] bottom-[0rem] left-[0rem]">
        <img
          className="absolute top-[-1.75rem] left-[0rem] rounded-mini w-[90rem] h-[70.063rem] object-cover"
          alt=""
          src="/image-91@2x.png"
        />
        <img
          className="absolute top-[-1.75rem] left-[-1.562rem] w-[10.438rem] h-[10.438rem] object-cover z-[1]"
          alt=""
          src="/untitled-design--1-removebgpreview-11@2x.png"
        />
      </main>
      <div className="self-stretch flex flex-col items-start justify-start gap-[0.562rem] max-w-full text-[#000] font-roboto">
        <div className="h-[5.5rem] relative inline-block z-[1] mq450:text-[1.375rem] mq750:text-[1.813rem]">
          <p className="m-0">OTP Verification</p>
        </div>
        <CodeInput />
      </div>
    </div>
  );
};

export default OTP;
