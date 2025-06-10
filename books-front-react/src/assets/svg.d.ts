declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.mp3'; // '*.wav' if you're using wav format

declare module "*.module.scss";
