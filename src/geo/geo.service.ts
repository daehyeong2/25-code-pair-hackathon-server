import { Injectable } from '@nestjs/common';
import { koreaGeo } from './korea-geo';
import * as turf from '@turf/turf';
import RBush from 'rbush';
import { Region } from 'src/emergency/types/region';

interface BBoxItem {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  index: number; // geoData.features 인덱스 저장
}

@Injectable()
export class GeoService {
  private geoData: GeoJSON.FeatureCollection;
  private rtree: RBush<BBoxItem>;

  constructor() {
    this.geoData = koreaGeo as GeoJSON.FeatureCollection;
  }

  async onModuleInit() {
    // R-tree 생성
    this.rtree = new RBush();

    // 모든 시군구 bbox 계산 후 R-tree에 삽입
    const boxes: BBoxItem[] = this.geoData.features.map((feature, idx) => {
      const [minX, minY, maxX, maxY] = turf.bbox(feature);
      return { minX, minY, maxX, maxY, index: idx };
    });
    this.rtree.load(boxes);
  }

  isNeighborsByDistance(
    geom1: GeoJSON.Geometry,
    geom2: GeoJSON.Geometry,
    thresholdMeters = 100,
  ): boolean {
    // 좌표 단순화해서 속도 개선 (tolerance는 조절 가능)
    const simple1 = turf.simplify(geom1, {
      tolerance: 0.0005,
      highQuality: false,
    });
    const simple2 = turf.simplify(geom2, {
      tolerance: 0.0005,
      highQuality: false,
    });
    const coords1 = turf.coordAll(simple1);
    const coords2 = turf.coordAll(simple2);

    for (const c1 of coords1) {
      for (const c2 of coords2) {
        const dist = turf.distance(turf.point(c1), turf.point(c2), {
          units: 'meters',
        });
        if (dist <= thresholdMeters) {
          return true; // 특정 거리 이내면 인접으로 간주
        }
      }
    }
    return false;
  }

  getNeighbors(target: Region): Region[] {
    const targetFeature = this.geoData.features.find(
      (f) =>
        f.properties?.parent_city === target.stage1 &&
        f.properties?.name === target.stage2,
    );
    if (!targetFeature) return [];

    // 타겟 구 bbox (조금 확장)
    const [minX, minY, maxX, maxY] = turf.bbox(targetFeature);
    const delta = 0.01; // 약 1km 정도 여유 (조절 가능)

    // R-tree로 후보군 bbox 검색
    const candidates = this.rtree.search({
      minX: minX - delta,
      minY: minY - delta,
      maxX: maxX + delta,
      maxY: maxY + delta,
    });

    const neighbors = candidates
      .map((item) => this.geoData.features[item.index])
      .filter((f) => {
        if (f.properties?.name === targetFeature.properties?.name) return false;
        return this.isNeighborsByDistance(targetFeature.geometry, f.geometry);
      });
    return neighbors.map((f) => ({
      stage1: f.properties?.parent_city,
      stage2: f.properties?.name,
    }));
  }
}
