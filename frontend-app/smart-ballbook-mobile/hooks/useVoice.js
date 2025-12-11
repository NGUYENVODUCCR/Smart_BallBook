import { useRef, useState } from "react";
import { WebView } from "react-native-webview";

export default function useVoice() {
  const webviewRef = useRef(null);
  const [result, setResult] = useState("");

  const startVoice = () => {
    webviewRef.current.postMessage("START");
  };

  const WebViewVoice = (
    <WebView
      ref={webviewRef}
      source={require("../assets/voice/voice.html")}
      onMessage={(event) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === "RESULT") {
            setResult(data.text);
          }
        } catch (e) {}
      }}
      style={{ height: 0, width: 0 }} // ẩn webview
    />
  );

  return { WebViewVoice, startVoice, result };
}
