// Firebase 설정
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// Firebase 프로젝트 설정
const firebaseConfig = {
  // TODO: Firebase 콘솔에서 설정 값들을 복사해서 여기에 붙여넣기
  apiKey: "AIzaSyDGYKhGOWqBzPEnB_sEdz6gDXyKUMcYsmA",
  authDomain: "mrs-photobooth.firebaseapp.com",
  projectId: "mrs-photobooth",
  storageBucket: "mrs-photobooth.firebasestorage.app",
  messagingSenderId: "791306015325",
  appId: "1:791306015325:web:3affd20cf828a97aea73b4",
  measurementId: "G-K8QN0TL66D"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Storage 인스턴스 생성
export const storage = getStorage(app);
export default app;
