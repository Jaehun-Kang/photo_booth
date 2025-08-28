import React, { useState, useEffect, useRef, useCallback } from 'react';
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

  // 버튼 크기 기준으로 폰트와 아이콘 크기 조정
  const adjustButtonSizes = useCallback(() => {
    if (!buttonsRef.current) return;

    const buttons = buttonsRef.current.querySelectorAll('.image-viewer__buttons--btn');
    const buttonsContainer = buttonsRef.current;
    
    // 버튼 컨테이너의 높이 (10vh)
    const containerHeight = buttonsContainer.getBoundingClientRect().height;
    
    buttons.forEach(button => {
      const buttonHeight = button.getBoundingClientRect().height;
      const buttonWidth = button.getBoundingClientRect().width;
      
      // 버튼 높이의 비율로 폰트 크기 계산 (높이의 25-30%)
      const fontSize = Math.max(buttonHeight * 0.28, 14); // 최소 14px
      
      // 아이콘 크기는 버튼 높이의 60-70%
      const iconSize = Math.max(buttonHeight * 0.65, 24); // 최소 24px
      
      // 폰트 크기 적용
      button.style.fontSize = `${fontSize}px`;
      
      // 아이콘 크기 적용
      const icon = button.querySelector('.icon');
      if (icon) {
        icon.style.width = `${iconSize}px`;
        icon.style.height = `${iconSize}px`;
      }
      
      console.log('버튼 크기 조정:', {
        containerHeight: Math.round(containerHeight),
        buttonHeight: Math.round(buttonHeight),
        buttonWidth: Math.round(buttonWidth),
        fontSize: Math.round(fontSize),
        iconSize: Math.round(iconSize)
      });
    });
  }, []);

  // 헤더 크기 기준으로 로고와 텍스트 크기 조정
  const adjustHeaderSizes = useCallback(() => {
    if (!headerRef.current) return;

    const headerContainer = headerRef.current;
    const logoSvg = headerContainer.querySelector('.result-logo-svg');
    const logoText = headerContainer.querySelector('.result-logo-text');
    
    // 헤더 컨테이너의 높이 (10vh)
    const headerHeight = headerContainer.getBoundingClientRect().height;
    
    if (logoSvg && logoText) {
      // 로고와 폰트 비율 130:48 기준으로 계산
      // 헤더 높이의 70-80%를 기준으로 하되, 비율 유지
      const baseSize = Math.min(Math.max(headerHeight * 0.75, 80), 160);
      
      // 130:48 비율 유지 (130/48 = 2.708...)
      const logoSize = baseSize;
      const textSize = Math.round(logoSize * (48 / 130)); // 로고 크기의 48/130 비율
      
      // 텍스트 margin-bottom은 현재 로고 높이의 8%
      const textMargin = Math.round(logoSize * 0.08); // 현재 로고 크기의 8%
      
      // 스타일 적용
      logoSvg.style.width = `${logoSize}px`;
      logoSvg.style.height = `${logoSize}px`;
      
      logoText.style.fontSize = `${textSize}px`;
      logoText.style.marginBottom = `${textMargin}px`;
      
      console.log('헤더 크기 조정 (130:48 비율, margin 로고높이의 8%):', {
        headerHeight: Math.round(headerHeight),
        logoSize: Math.round(logoSize),
        textSize: Math.round(textSize),
        ratio: `${logoSize}:${textSize} (목표: 130:48)`,
        textMargin: `${textMargin}px (로고 ${logoSize}px의 8%)`
      });
    }
  }, []);

  // 이미지 크기 계산 함수
  const calculateImageSize = useCallback(() => {
    if (!headerRef.current || !buttonsRef.current) return;

    // 더 정확한 요소 크기 계산
    const headerRect = headerRef.current.getBoundingClientRect();
    const buttonsRect = buttonsRef.current.getBoundingClientRect();
    
    const headerHeight = headerRect.height;
    const buttonsHeight = buttonsRect.height;
    const isMobile = window.innerWidth <= 768;
    
    // 모바일과 데스크톱에서 다른 패딩 적용
    const padding = isMobile ? 55 : 40; // 모바일에서 더 큰 패딩 (40px + 15px)
    const gap = 32; // grid gap (1rem * 2)
    const shadowPadding = 24; // 그림자를 위한 여백 (12px * 2)
    
    // 모바일에서 더 안전한 여백 계산
    const safeAreaTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0');
    const safeAreaBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0');
    
    const availableHeight = window.innerHeight - headerHeight - buttonsHeight - padding - gap - safeAreaTop - safeAreaBottom - shadowPadding;
    const availableWidth = window.innerWidth - 40 - shadowPadding; // 좌우 패딩 + 그림자 여백
    
    // 최소 높이 보장 (모바일에서 너무 작아지는 것 방지)
    const minHeight = Math.min(200, window.innerHeight * 0.3);
    const finalHeight = Math.max(availableHeight, minHeight);
    
    console.log('이미지 크기 계산 (모바일 대응):', {
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      isMobile,
      headerHeight,
      buttonsHeight,
      availableHeight,
      finalHeight,
      availableWidth,
      shadowPadding,
      safeArea: `top:${safeAreaTop}, bottom:${safeAreaBottom}`
    });
    
    setImageStyle({
      width: 'auto',
      height: `${finalHeight}px`,
      maxWidth: `${Math.min(availableWidth, 400)}px`,
      maxHeight: `${finalHeight}px`,
      objectFit: 'contain'
    });

    // 버튼 크기도 함께 조정
    setTimeout(() => {
      adjustButtonSizes();
      adjustHeaderSizes();
    }, 50);
  }, [adjustButtonSizes, adjustHeaderSizes]);

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
    console.log('🖼️ 이미지 로딩 성공 - 그림자 적용됨');
    setImageError(null);
    
    // 이미지 로드 후 크기 재계산
    setTimeout(() => {
      calculateImageSize();
    }, 100);
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
        console.log('URL 파라미터에서 이미지 로드 완료');
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
    let resizeTimer;
    
    const handleResize = () => {
      // 모바일에서 키보드나 브라우저 UI 변화에 대응
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        calculateImageSize();
      }, 150); // 디바운싱으로 성능 최적화
    };

    // 화면 방향 변화 감지 (모바일)
    const handleOrientationChange = () => {
      setTimeout(() => {
        calculateImageSize();
      }, 300); // 방향 변화 후 약간의 지연
    };

    // 뷰포트 변화 감지 (모바일에서 브라우저 주소창 숨김/표시)
    const handleVisualViewportChange = () => {
      if (window.visualViewport) {
        calculateImageSize();
      }
    };

    // 초기 계산 (DOM 렌더링 완료 후)
    const initialTimer = setTimeout(() => {
      calculateImageSize();
    }, 100);

    // 추가 안전 장치 (이미지 로드 후)
    const fallbackTimer = setTimeout(() => {
      calculateImageSize();
    }, 500);

    // 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // 모바일 브라우저 뷰포트 변화 감지
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
    }

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(fallbackTimer);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
      }
    };
  }, [imageData, adjustButtonSizes, adjustHeaderSizes, calculateImageSize]); // imageData가 변경될 때마다 재계산

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
          text: '포토부스에서 찍은 사진입니다!',
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
        console.log('CORS 프록시 테스트 URL 적용:', corsProxyUrl);
      } catch (error) {
        console.error('테스트 URL 생성 실패:', error);
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
