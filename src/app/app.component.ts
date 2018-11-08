import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as echarts from 'echarts';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  @ViewChild('chart') chart: ElementRef;

  mapLoaded = false;
  options = {};
  down = false;

  ctprvnList = [];
  sigList = [];
  showBorough = false;

  ctprvn = '0';
  sig;

  private mapCenter = [128.168944, 36.536236];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadGeoJSON('0');
  }

  mouseUp(params:any): void {
    console.log(params);
    console.log('mouseup');

    if (!this.down) {
      return;
    }
    this.down = false;

    // let mapChart = echarts.getInstanceByDom(this.chart.nativeElement);
    // let geoCoord = mapChart.convertFromPixel({seriesName: 'SeoulMap'}, [params.event.offsetX, params.event.offsetY]);

    // console.log(mapChart.getOption().series[0].zoom);

    // mapChart.setOption({
    //   series: [{
    //     center: mapChart.getOption().series[0]['zoom'] > 1 ? this.mapCenter : geoCoord,
    //     zoom: mapChart.getOption().series[0]['zoom'] > 1 ? 1 : 4,
    //     animationDurationUpdate: 1000,
    //     animationEasingUpdate: 'cubicInOut'
    //   }]
    // });

    // mapChart.showLoading();
    if (params.data.code.length == 2) {
      this.ctprvn = params.data.code;
      this.loadGeoJSON(params.data.code);
    } else {
      this.sig = params.data.code;
    }
  }

  mouseDown(params:any): void {
    console.log('mousedown');
    this.down = true;
  }

  mouseMove(params:any): void {
    console.log('mousemove');
    this.down = false;
  }

  onChangeCtprvn(): void {
    this.loadGeoJSON(this.ctprvn);
  }

  onChangeSig(): void {
    // 영역 강조
  }

  private loadGeoJSON(code = '0'): void {
    this.mapLoaded = false;
    this.http.get('assets/data/' + code + '.json')
      .subscribe(geoJson => {

        this.setSelectItems(geoJson, code !== '0');

        // hide loading:
        this.mapLoaded = true;
        // register map:
        echarts.registerMap('Korea', geoJson);

        this.options = {
          title: {
            text: '대한민국 행정구역 2018.04',
            subtext: '공간정보시스템 기반 기술 연구소 @지오서비스(GEOSERVICE)',
            sublink: 'http://www.gisdeveloper.co.kr/?p=2332'
          },
          tooltip: {
            trigger: 'item',
            formatter: '{b}<br/>{c}'
          },
          toolbox: {
            show: true,
            orient: 'vertical',
            left: 'right',
            top: 'center',
            feature: {
              dataView: {
                title: '데이터 보기',
                readOnly: false,
                lang:  ['데이터 조회', '닫기', '갱신']
              },
              saveAsImage: {
                title: '이미지로 저장'
              }
            }
          },
          visualMap: {
            min: 800,
            max: 50000,
            text: ['높음', '낮음'],
            realtime: false,
            calculable: true,
            inRange: {
              color: ['#e0ffff', '#006edd']
            }
          },
          animation: true,
          animationDurationUpdate: 1000,
          animationEasingUpdate: 'cubicInOut',
          series: [
            {
              name: 'KoreaMap',
              type: 'map',
              mapType: 'Korea', // map type should be registered
              roam: true,
              // center: this.mapCenter,
              // zoom: 1.5,
              selectedMode: 'single',
              scaleLimit: {
                min: 1,
                max: 4
              },
              label: {
                normal: {
                  show: true,
                  formatter: '{b}\n({c})',
                  position: 'inside',
                  backgroundColor: '#fff',
                  padding: [4, 5],
                  borderRadius: 3,
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.5)',
                  color: '#777',
                  rich: {
                    b: {
                      backgroundColor: 'yellow'
                    }
                  }
                }
              },
              itemStyle: {
                normal: {
                  borderColor: 'rgba(0, 0, 0, 0.2)'
                },
                emphasis: {
                  areaColor: 'yellow',
                  shadowOffsetX: 0,
                  shadowOffsetY: 0,
                  shadowBlur: 20,
                  borderWidth: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              },
              data: this.generateData(geoJson),
              nameMap: this.generateNameMap(geoJson)
            }
          ]
        };

      });
  }

  private generateNameMap(geoJson:any): any {
    let nameMap = {};
    geoJson.features.forEach((feature) => {
      nameMap[feature.properties.name] = feature.properties.label;
    });

    return nameMap;
  }

  private generateData(geoJson:any) : Array<any> {
    return geoJson.features.map((feature) => {
      return {
        code: feature.properties.code,
        name: feature.properties.label,
        value: this.generateRandomBetween(800, 50000),
        selected: this.ctprvn != '0' && feature.properties.code == this.sig
      }
    });
  }

  private generateRandomBetween(min: number, max: number) : number {
    return Math.floor(Math.random()*(max-min+1)) + min;
  }

  private setSelectItems(geoJson: any, isSig: boolean): void {
    let items = geoJson.features.map((feature) => {
      return { name: feature.properties.label, value: feature.properties.code };
    });

    if (isSig) {
      this.sigList = items;
      this.sig = this.sigList[0].value;
      this.showBorough = true;
    } else {
      this.ctprvnList = items;
      this.showBorough = false;
    }
  }

}
