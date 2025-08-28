import React, { useState, useEffect } from 'react';
import '../styles/ImageViewer.css';

const ImageViewer = () => {
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(null);

  // 이미지 로딩 에러 핸들러
  const handleImageError = (error) => {
    console.error('❌ 이미지 로딩 실패:', error);
    
    // CORS 프록시 백업 URL이 있고, 현재 직접 Firebase URL을 사용 중이라면
    if (window.corsProxyBackup && imageData && imageData.includes('firebasestorage.googleapis.com')) {
      console.log('🔄 CORS 프록시로 재시도:', window.corsProxyBackup);
      setImageData(window.corsProxyBackup);
      window.corsProxyBackup = null; // 무한 루프 방지
      return;
    }
    
    setImageError('이미지를 불러올 수 없습니다.');
    
    // Firebase URL을 직접 테스트해보기 위한 링크 제공
    if (imageData && imageData.includes('firebasestorage.googleapis.com')) {
      console.log('🔗 Firebase URL 직접 테스트:', imageData);
      console.log('💡 위 URL을 새 탭에서 직접 열어서 이미지가 표시되는지 확인해보세요');
    }
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
    const urlParam = urlParams.get('url'); // 기존 방식 (하위 호환)
    const firebaseUrlParam = urlParams.get('firebaseUrl'); // 새로운 Base64 방식
    
    console.log('🔍 ImageViewer URL 파라미터 분석:');
    console.log('- 전체 URL:', window.location.href);
    console.log('- search 부분:', window.location.search);
    console.log('- imageId:', imageId);
    console.log('- dataParam:', dataParam ? 'present' : 'none');
    console.log('- urlParam:', urlParam ? urlParam : 'none');
    console.log('- firebaseUrlParam:', firebaseUrlParam ? firebaseUrlParam : 'none');
    
    if (firebaseUrlParam) {
      // 새로운 Base64 방식 (Firebase URL 안전하게 전달)
      try {
        const decodedFirebaseUrl = atob(firebaseUrlParam);
        console.log('🔗 Base64 디코딩된 Firebase URL:', decodedFirebaseUrl);
        console.log('🧪 Firebase URL 유효성 체크:', decodedFirebaseUrl.startsWith('https://firebasestorage.googleapis.com'));
        
        // 먼저 직접 Firebase URL로 시도
        setImageData(decodedFirebaseUrl);
        console.log('📱 Firebase Storage URL 직접 로드 시도');
        
        // 실패할 경우를 대비해 CORS 프록시 URL도 준비
        const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(decodedFirebaseUrl)}`;
        console.log('🌐 백업 CORS 프록시 URL 준비:', corsProxyUrl);
        
        // 이미지 로딩 실패 시 사용할 백업 URL을 window 객체에 저장
        window.corsProxyBackup = corsProxyUrl;
        
      } catch (error) {
        console.error('❌ Base64 디코딩 실패:', error);
        console.log('🔧 원본 firebaseUrlParam:', firebaseUrlParam);
      }
    } else if (urlParam) {
      // Firebase Storage URL 디코딩 (쿼리 파라미터 충돌 방지용)
      try {
        const decodedUrl = decodeURIComponent(urlParam);
        console.log('🔗 디코딩된 Firebase URL:', decodedUrl);
        console.log('🧪 Firebase URL 유효성 체크:', decodedUrl.startsWith('https://firebasestorage.googleapis.com'));
        
        // CORS 문제 해결을 위한 fetch 시도
        console.log('🌐 CORS 우회를 위한 fetch 시도...');
        fetch(decodedUrl, {
          method: 'GET',
          mode: 'cors'
        })
        .then(response => {
          if (response.ok) {
            console.log('✅ Firebase 이미지 fetch 성공');
            setImageData(decodedUrl);
          } else {
            console.error('❌ Firebase 이미지 fetch 실패:', response.status, response.statusText);
            // 일반적인 img 태그 방식으로 시도
            setImageData(decodedUrl);
          }
        })
        .catch(fetchError => {
          console.error('❌ Firebase fetch 오류:', fetchError);
          console.log('🔄 일반 img 태그 방식으로 fallback...');
          // fetch 실패 시에도 img 태그로 시도
          setImageData(decodedUrl);
        });
        
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

  const downloadImage = async () => {
    if (!imageData) return;

    try {
      // Firebase Storage URL에서 직접 다운로드 시도
      const urlParams = new URLSearchParams(window.location.search);
      const firebaseUrlParam = urlParams.get('firebaseUrl');
      
      if (firebaseUrlParam) {
        // Base64 디코딩하여 원본 Firebase URL 얻기
        const originalFirebaseUrl = atob(firebaseUrlParam);
        console.log('📥 Firebase URL로 직접 다운로드 시도:', originalFirebaseUrl);
        
        // Firebase URL에 다운로드 파라미터 추가
        const downloadUrl = originalFirebaseUrl + '&response-content-disposition=attachment';
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `photobooth_${Date.now()}.png`;
        link.target = '_blank'; // 새 탭에서 열기
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ Firebase 직접 다운로드 링크 생성 완료');
        return;
      }
      
      // 일반적인 방식으로 다운로드
      const link = document.createElement('a');
      link.href = imageData;
      link.download = `photobooth_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('❌ 다운로드 실패:', error);
      
      // 실패 시 기본 방식으로 시도
      const link = document.createElement('a');
      link.href = imageData;
      link.download = `photobooth_${Date.now()}.png`;
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
        const file = new File([blob], `photobooth_${Date.now()}.png`, { type: 'image/png' });
        
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

  // CORS 프록시로 이미지 로드 테스트
  const testCorsProxy = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const firebaseUrlParam = urlParams.get('firebaseUrl');
    
    if (firebaseUrlParam) {
      try {
        const decodedFirebaseUrl = atob(firebaseUrlParam);
        const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(decodedFirebaseUrl)}`;
        setImageData(corsProxyUrl);
        setImageError(null);
        console.log('🧪 CORS 프록시 테스트 URL 적용:', corsProxyUrl);
      } catch (error) {
        console.error('❌ 테스트 URL 생성 실패:', error);
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
            crossOrigin="anonymous"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          {imageError && (
            <div className="image-error">
              <p style={{color: 'red', textAlign: 'center'}}>❌ {imageError}</p>
              <p style={{fontSize: '0.9rem', color: '#666', wordBreak: 'break-all'}}>
                Firebase URL: {imageData}
              </p>
              {imageData && imageData.includes('firebasestorage.googleapis.com') && (
                <div style={{marginTop: '1rem', textAlign: 'center'}}>
                  <a 
                    href={imageData} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontSize: '0.9rem'
                    }}
                  >
                    🔗 Firebase URL 직접 테스트
                  </a>
                  <p style={{fontSize: '0.8rem', color: '#999', marginTop: '0.5rem'}}>
                    위 버튼을 클릭해서 Firebase에서 이미지를 직접 불러올 수 있는지 확인해보세요
                  </p>
                </div>
              )}
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
          
          {imageError && (
            <button 
              onClick={testCorsProxy}
              className="action-btn action-btn--warning"
              style={{backgroundColor: '#ff9800', color: 'white'}}
            >
              🔄 프록시로 재시도
            </button>
          )}
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
