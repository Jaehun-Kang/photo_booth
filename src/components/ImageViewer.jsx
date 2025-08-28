import React, { useState, useEffect, useRef } from 'react';
import '../styles/ImageViewer.css';
import shareIcon from '../assets/share.svg';

const ImageViewer = () => {
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(null);
  const [imageStyle, setImageStyle] = useState({});
  const headerRef = useRef(null);
  const buttonsRef = useRef(null);
  const imageRef = useRef(null);

  // 이미지 크기 계산 함수
  const calculateImageSize = () => {
    if (!headerRef.current || !buttonsRef.current) return;

    const headerHeight = headerRef.current.offsetHeight;
    const buttonsHeight = buttonsRef.current.offsetHeight;
    const padding = 0; // 상하 패딩
    const gap = 32; // grid gap (1rem * 2)
    
    const availableHeight = window.innerHeight - headerHeight - buttonsHeight - padding - gap;
    const availableWidth = window.innerWidth - 40; // 좌우 패딩
    
    console.log('이미지 크기 계산:', {
      windowHeight: window.innerHeight,
      headerHeight,
      buttonsHeight,
      availableHeight,
      availableWidth
    });
    
    setImageStyle({
      width: 'auto',
      height: `${availableHeight}px`, // 정확한 높이를 픽셀로 설정
      maxWidth: `${Math.min(availableWidth, 400)}px`,
      maxHeight: `${availableHeight}px`,
      objectFit: 'contain'
    });
  };

  // 이미지 로딩 에러 핸들러
  const handleImageError = (error) => {
    console.error('이미지 로딩 실패:', error);
    
    // CORS 프록시 백업 URL이 있고, 현재 직접 Firebase URL을 사용 중이라면
    if (window.corsProxyBackup && imageData && imageData.includes('firebasestorage.googleapis.com')) {
      console.log('CORS 프록시로 재시도:', window.corsProxyBackup);
      setImageData(window.corsProxyBackup);
      window.corsProxyBackup = null; // 무한 루프 방지
      return;
    }
    
    setImageError('이미지를 불러올 수 없습니다.');
    
    // Firebase URL을 직접 테스트해보기 위한 링크 제공
    if (imageData && imageData.includes('firebasestorage.googleapis.com')) {
      console.log('Firebase URL 직접 테스트:', imageData);
      console.log('위 URL을 새 탭에서 직접 열어서 이미지가 표시되는지 확인해보세요');
    }
  };

  // 이미지 로딩 성공 핸들러
  const handleImageLoad = () => {
    console.log('이미지 로딩 성공');
    setImageError(null);
  };

  useEffect(() => {
    // URL에서 이미지 데이터 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const imageId = urlParams.get('id');
    const dataParam = urlParams.get('data');
    const urlParam = urlParams.get('url'); // 기존 방식 (하위 호환)
    const firebaseUrlParam = urlParams.get('firebaseUrl'); // 새로운 Base64 방식
    
    console.log('ImageViewer URL 파라미터 분석:');
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
        console.log('Base64 디코딩된 Firebase URL:', decodedFirebaseUrl);
        console.log('Firebase URL 유효성 체크:', decodedFirebaseUrl.startsWith('https://firebasestorage.googleapis.com'));
        
        // 먼저 직접 Firebase URL로 시도
        setImageData(decodedFirebaseUrl);
        console.log('Firebase Storage URL 직접 로드 시도');
        
        // 실패할 경우를 대비해 CORS 프록시 URL도 준비
        const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(decodedFirebaseUrl)}`;
        console.log('백업 CORS 프록시 URL 준비:', corsProxyUrl);
        
        // 이미지 로딩 실패 시 사용할 백업 URL을 window 객체에 저장
        window.corsProxyBackup = corsProxyUrl;
        
      } catch (error) {
        console.error('Base64 디코딩 실패:', error);
        console.log('원본 firebaseUrlParam:', firebaseUrlParam);
      }
    } else if (urlParam) {
      // Firebase Storage URL 디코딩 (쿼리 파라미터 충돌 방지용)
      try {
        const decodedUrl = decodeURIComponent(urlParam);
        console.log('디코딩된 Firebase URL:', decodedUrl);
        console.log('Firebase URL 유효성 체크:', decodedUrl.startsWith('https://firebasestorage.googleapis.com'));
        
        // CORS 문제 해결을 위한 fetch 시도
        console.log('CORS 우회를 위한 fetch 시도...');
        fetch(decodedUrl, {
          method: 'GET',
          mode: 'cors'
        })
        .then(response => {
          if (response.ok) {
            console.log('Firebase 이미지 fetch 성공');
            setImageData(decodedUrl);
          } else {
            console.error('Firebase 이미지 fetch 실패:', response.status, response.statusText);
            // 일반적인 img 태그 방식으로 시도
            setImageData(decodedUrl);
          }
        })
        .catch(fetchError => {
          console.error('Firebase fetch 오류:', fetchError);
          console.log('일반 img 태그 방식으로 fallback...');
          // fetch 실패 시에도 img 태그로 시도
          setImageData(decodedUrl);
        });
        
        console.log('Firebase Storage URL에서 이미지 로드 완료');
      } catch (error) {
        console.error('Firebase URL 디코딩 실패:', error);
        console.log('원본 urlParam:', urlParam);
      }
    } else if (dataParam) {
      // URL 파라미터에서 직접 이미지 데이터 가져오기
      try {
        const decodedData = decodeURIComponent(dataParam);
        setImageData(decodedData);
        console.log('📱 URL 파라미터에서 이미지 로드 완료');
      } catch (error) {
        console.error('URL 파라미터 디코딩 실패:', error);
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
        console.log('localStorage에서 이미지 로드 완료');
      }
    }
    setLoading(false);
  }, []);

  // 이미지 크기 계산을 위한 useEffect
  useEffect(() => {
    const handleResize = () => {
      calculateImageSize();
    };

    // 초기 계산
    const timer = setTimeout(() => {
      calculateImageSize();
    }, 100);

    // 윈도우 리사이즈 이벤트 리스너
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [imageData]); // imageData가 변경될 때마다 재계산

  const downloadImage = async () => {
    if (!imageData) return;

    try {
      console.log('이미지 다운로드 시작...');
      
      // fetch를 사용해서 이미지 데이터를 가져오기
      const response = await fetch(imageData);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 응답을 Blob으로 변환
      const blob = await response.blob();
      console.log('이미지 데이터 fetch 완료');
      
      // Blob을 다운로드 가능한 URL로 변환
      const blobUrl = window.URL.createObjectURL(blob);
      
      // 다운로드 링크 생성
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `photobooth_${Date.now()}.png`;
      
      // 링크를 DOM에 추가하고 클릭 (새 창에서 열리지 않음)
      document.body.appendChild(link);
      link.click();
      
      // 정리
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl); // 메모리 해제
      
      console.log('이미지 다운로드 완료');
      
    } catch (error) {
      console.error('다운로드 실패:', error);
      
      // 실패 시 기본 방식으로 시도 (target 제거)
      try {
        const link = document.createElement('a');
        link.href = imageData;
        link.download = `photobooth_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('기본 방식으로 다운로드 시도');
      } catch (fallbackError) {
        console.error('기본 방식 다운로드도 실패:', fallbackError);
        alert('다운로드에 실패했습니다. 이미지를 길게 터치해서 저장해보세요.');
      }
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
      <div className="image-viewer__header" ref={headerRef}>
        <div className='result-logo'>
          <InlineLogoSVG className='result-logo-svg' />
          <div className='result-logo-text'>
            마법연구회
          </div>
        </div>
      </div>
      <div className="image-viewer__image">
        <img 
          ref={imageRef}
          src={imageData} 
          alt="PhotoBooth 촬영 사진" 
          className="image-viewer__image--img"
          style={imageStyle}
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
                  Firebase URL 직접 테스트
                </a>
                <p style={{fontSize: '0.8rem', color: '#999', marginTop: '0.5rem'}}>
                  위 버튼을 클릭해서 Firebase에서 이미지를 직접 불러올 수 있는지 확인해보세요
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="image-viewer__buttons" ref={buttonsRef}>
        <button 
          onClick={downloadImage}
          className="image-viewer__buttons--btn primary"
        >
          다운로드
        </button>
        
        <button 
          onClick={shareImage}
          className="image-viewer__buttons--btn secondary"
        >
          <img src={shareIcon} alt="공유" className="icon" />
        </button>
        
        {imageError && (
          <button 
            onClick={testCorsProxy}
            className="image-viewer__buttons--btn warning"
          >
            프록시로 재시도
          </button>
        )}
      </div>
    </div>
  );
};

// FilterScreenRender와 동일한 로고 SVG 컴포넌트 (ImageViewer용 - 흰색)
function InlineLogoSVG(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" {...props}>
      <g id="logo1">
        {/* 십자형 두 패스를 정확히 하나로 합침 */}
        <path
          fill="white"
          d="
            M500,927c0-477-5-495-113-495,108,0,113,0,113-360
            M500,927c0-477,5-495,113-495-108,0-113,0-113-360
          "
        />
        <path fill="white" d="M178.72,549,19,434A2.5,2.5,0,0,1,19,430L178.72,315c-39.34,35.29-61.42,75-61.42,117S139.38,513.71,178.72,549Z"/>
        <path fill="white" d="M820.28,549,980,434a2.5,2.5,0,0,0,0-4.06L820.28,315c39.34,35.29,61.42,75,61.42,117S859.62,513.71,820.28,549Z"/>
      </g>
    </svg>
  );
}

export default ImageViewer;
