// 필터 사용 로그를 기록하는 유틸리티 함수들

/**
 * 필터 사용 기록을 저장합니다.
 * @param {string} filterName - 사용된 필터 이름
 * @param {number} filterIndex - 필터 인덱스
 */
export async function logFilterUsage(filterName, filterIndex) {
  try {
    const timestamp = new Date().toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const logEntry = timestamp + ' - 필터 사용: ' + filterName + ' (인덱스: ' + filterIndex + ')\n';

    // 기존 로그 내용 읽기 (로컬 스토리지에서)
    const existingLog = localStorage.getItem('filter_usage_log') || '';
    const newLogContent = existingLog + logEntry;

    // 로그 파일 다운로드 (브라우저에서는 실제 파일 시스템에 쓸 수 없으므로)
    const blob = new Blob([newLogContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // 숨겨진 링크를 만들어서 다운로드 실행
    const link = document.createElement('a');
    link.href = url;
    link.download = 'filter_usage_log.txt';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // URL 해제
    URL.revokeObjectURL(url);

    console.log('📝 필터 사용 로그 기록됨: ' + filterName + ' at ' + timestamp);
    
    // 로컬 스토리지에도 백업 저장
    saveLogToLocalStorage(logEntry);
    
  } catch (error) {
    console.error('❌ 필터 로그 기록 실패:', error);
  }
}

/**
 * 로컬 스토리지에 로그를 백업으로 저장합니다.
 * @param {string} logEntry - 저장할 로그 엔트리
 */
function saveLogToLocalStorage(logEntry) {
  try {
    const existingLog = localStorage.getItem('filter_usage_log') || '';
    const newLog = existingLog + logEntry;
    
    // 로그가 너무 길어지면 오래된 항목 제거 (최대 1000줄)
    const lines = newLog.split('\n');
    if (lines.length > 1000) {
      const trimmedLog = lines.slice(-1000).join('\n');
      localStorage.setItem('filter_usage_log', trimmedLog);
    } else {
      localStorage.setItem('filter_usage_log', newLog);
    }
    
    console.log('💾 로컬 스토리지에 로그 백업 저장 완료');
  } catch (error) {
    console.error('❌ 로컬 스토리지 로그 저장 실패:', error);
  }
}
