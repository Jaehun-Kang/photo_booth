import { templateFilter1 } from '../filters/filter_1';
import { templateFilter2 } from '../filters/filter_2';
import { templateFilter3 } from '../filters/filter_3';
import { templateFilter4 } from '../filters/filter_4';
import { templateFilter5 } from '../filters/filter_5';
import { templateFilter6 } from '../filters/filter_6';
import { templateFilter7 } from '../filters/filter_7';
import { templateFilter8 } from '../filters/filter_8';
import { circleFilter } from '../filters/filter_sample_1';
import { fadeFilter } from '../filters/filter_sample_2';
import { cameraView } from '../filters/filter_sample_3';

/* [!중요!] 필터 선택해서 만드실 때 디스코드 포토부스 채널에 몇번 필터 파일 사용하겠다고 말씀해주세요. */
/* 필터 함수 이름은 아래 배열의 templateFilter쪽과 위쪽 해당하는 import {} 안까지 변경해주시면 됩니다. */
export const filters = [
  templateFilter1,
  templateFilter2,
  templateFilter3,
  templateFilter4,
  templateFilter5,
  templateFilter6,
  templateFilter7,
  templateFilter8,
  circleFilter,
  fadeFilter,
  cameraView,
];