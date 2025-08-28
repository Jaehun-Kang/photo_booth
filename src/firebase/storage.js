import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config.js';

/**
 * 이미지를 Firebase Storage에 업로드하고 다운로드 URL 반환
 * @param {string} dataUrl - 이미지 데이터 URL
 * @param {string} fileName - 파일명 (확장자 포함)
 * @returns {Promise<string>} 업로드된 이미지의 다운로드 URL
 */
export const uploadImageToFirebase = async (dataUrl, fileName) => {
  try {
    // Data URL을 Blob으로 변환
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    // Firebase Storage 참조 생성 (photos 폴더 하위에 저장)
    const imageRef = ref(storage, `photos/${fileName}`);
    
    console.log(`📤 Firebase Storage 업로드 시작: ${fileName}`);
    
    // 이미지 업로드
    const snapshot = await uploadBytes(imageRef, blob);
    console.log(`✅ Firebase Storage 업로드 완료: ${snapshot.metadata.name}`);
    
    // 다운로드 URL 가져오기
    const downloadURL = await getDownloadURL(imageRef);
    console.log(`🔗 다운로드 URL 생성: ${downloadURL}`);
    
    return downloadURL;
    
  } catch (error) {
    console.error('❌ Firebase Storage 업로드 실패:', error);
    throw new Error(`Firebase 업로드 실패: ${error.message}`);
  }
};

/**
 * 고유한 파일명 생성
 * @param {string} prefix - 파일명 접두사 (기본값: 'photobooth')
 * @returns {string} 고유한 파일명
 */
export const generateUniqueFileName = (prefix = 'photobooth') => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${randomId}.jpg`;
};
