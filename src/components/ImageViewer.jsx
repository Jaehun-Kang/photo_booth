import React, { useState, useEffect } from 'react';
import '../styles/ImageViewer.css';

const ImageViewer = () => {
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(null);

  // 이미지 로딩 에러 핸들러
  const handleImageError = (error) => {
    console.error('❌ 이미지 로딩 실패:', error);
    setImageError('이미지를 불러올 수 없습니다.');
  };

  // 이미지 로딩 성공 핸들러
  const handleImageLoad = () => {
    console.log('✅ 이미지 로딩 성공');
    setImageError(null);
  };

  useEffect(() => {
    // URL에서 이미지 데이터 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const imageId = urlParams.get('id');
    const dataParam = urlParams.get('data');
    const urlParam = urlParams.get('url'); // Firebase Storage URL
    
    console.log('🔍 ImageViewer URL 파라미터 분석:');
    console.log('- 전체 URL:', window.location.href);
    console.log('- search 부분:', window.location.search);
    console.log('- imageId:', imageId);
    console.log('- dataParam:', dataParam ? 'present' : 'none');
    console.log('- urlParam:', urlParam ? urlParam : 'none');
    
    if (urlParam) {
      // Firebase Storage URL 디코딩 (쿼리 파라미터 충돌 방지용)
      try {
        const decodedUrl = decodeURIComponent(urlParam);
        console.log('🔗 디코딩된 Firebase URL:', decodedUrl);
        console.log('🧪 Firebase URL 유효성 체크:', decodedUrl.startsWith('https://firebasestorage.googleapis.com'));
        setImageData(decodedUrl);
        console.log('📱 Firebase Storage URL에서 이미지 로드 완료');
      } catch (error) {
        console.error('❌ Firebase URL 디코딩 실패:', error);
        console.log('🔧 원본 urlParam:', urlParam);
      }
    } else if (dataParam) {
      // URL 파라미터에서 직접 이미지 데이터 가져오기
      try {
        const decodedData = decodeURIComponent(dataParam);
        setImageData(decodedData);
        console.log('📱 URL 파라미터에서 이미지 로드 완료');
      } catch (error) {
        console.error('❌ URL 파라미터 디코딩 실패:', error);
      }
    } else if (imageId) {
      // localStorage에서 이미지 ID로 데이터 가져오기
      let savedImage = localStorage.getItem(`photo_single_${imageId}`);
      
      // 단일 이미지가 없으면 일반 이미지 버전 사용
      if (!savedImage) {
        savedImage = localStorage.getItem(`photo_${imageId}`);
      }
      
      if (savedImage) {
        setImageData(savedImage);
        console.log('📱 localStorage에서 이미지 로드 완료');
      }
    }
    setLoading(false);
  }, []);

  const downloadImage = () => {
    if (imageData) {
      const link = document.createElement('a');
      link.href = imageData;
      link.download = `photobooth_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const shareImage = async () => {
    if (!imageData) return;

    if (navigator.share) {
      try {
        // Data URL을 Blob으로 변환
        const response = await fetch(imageData);
        const blob = await response.blob();
        const file = new File([blob], `photobooth_${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        await navigator.share({
          title: 'PhotoBooth 이미지',
          text: '포토부스에서 찍은 사진입니다! 📸',
          files: [file]
        });
      } catch (error) {
        console.error('공유 실패:', error);
        downloadImage(); // 공유 실패 시 다운로드로 fallback
      }
    } else {
      // Web Share API 미지원 시 클립보드 복사 시도
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('링크가 클립보드에 복사되었습니다!');
      } catch {
        downloadImage(); // 클립보드 복사도 실패 시 다운로드
      }
    }
  };

  if (loading) {
    return (
      <div className="image-viewer">
        <div className="loading">이미지를 불러오는 중...</div>
      </div>
    );
  }

  if (!imageData) {
    return (
      <div className="image-viewer">
        <div className="error">
          <h2>이미지를 찾을 수 없습니다</h2>
          <p>링크가 만료되었거나 잘못된 주소입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="image-viewer">
      <div className="image-viewer__header">
        <h1>📸 PhotoBooth</h1>
        <p>촬영된 사진을 저장하고 공유하세요</p>
      </div>
      
      <div className="image-viewer__content">
        <div className="image-container">
          <img 
            src={imageData} 
            alt="PhotoBooth 촬영 사진" 
            className="shared-image"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          {imageError && (
            <div className="image-error">
              <p style={{color: 'red', textAlign: 'center'}}>❌ {imageError}</p>
              <p style={{fontSize: '0.9rem', color: '#666'}}>Firebase URL: {imageData?.substring(0, 100)}...</p>
            </div>
          )}
        </div>
        
        <div className="image-actions">
          <button 
            onClick={downloadImage}
            className="action-btn action-btn--primary"
          >
            📥 이미지 다운로드
          </button>
          
          <button 
            onClick={shareImage}
            className="action-btn action-btn--secondary"
          >
            📤 공유하기
          </button>
        </div>
        
        <div className="image-info">
          <p>📱 모바일에서도 쉽게 저장하고 공유할 수 있습니다</p>
        </div>
      </div>
      
      <div className="image-viewer__footer">
        <p>✨ PhotoBooth에서 촬영된 소중한 순간</p>
      </div>
    </div>
  );
};

export default ImageViewer;
