import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

@Component({
  selector: 'app-dashboard-lista-electores',
  templateUrl: './dashboard-lista-electores.component.html',
  styleUrls: ['./dashboard-lista-electores.component.scss']
})

export class DashboardListaElectoresComponent implements AfterViewInit, OnDestroy {

    private root2!: am5.Root;
  
    ngAfterViewInit() {
      am5.addLicense("AM5C-357384425");
  
  
      // Crear raíz del gráfico
    this.root2 = am5.Root.new("piechartdiv2");

    // Aplicar un tema
    this.root2.setThemes([
      am5themes_Animated.new(this.root2)
    ]);

    // Crear un gráfico de tipo Pie
    let chart2 = this.root2.container.children.push(am5percent.PieChart.new(this.root2, {
      layout: this.root2.horizontalLayout,
      radius: am5.percent(60)
    }));

    // Crear una serie de datos de tipo Pie
    let series2 = chart2.series.push(am5percent.PieSeries.new(this.root2, {
      valueField: "value",
      categoryField: "category",
      alignLabels: false
    }));
    // Configurar la paleta de colores personalizada
    series2.slices.template.setAll({
      stroke: am5.color("#ffffff"),
      strokeWidth: 1
    })

    series2.set("colors", am5.ColorSet.new(this.root2, {
      colors: [
        am5.color("#003874"), // Color para el primer segmento
        am5.color("#B2B4B6"), // Color para el segundo segmento
      ],
    }));

    // Agregar datos
    series2.data.setAll([
      { category: "Asistencia", value: 150 },
      { category: "Omisos", value: 25 },
    ]);

    // Agregar etiquetas y valores dentro del gráfico
    series2.labels.template.setAll({
      text: "{valuePercentTotal.formatNumber('0.0')}",
      fontSize: 12,
      fontWeight: "600"
    });

    series2.slices.template.setAll({
      tooltipText: "[fontSize: 12px]{category}: {value} ({valuePercentTotal.formatNumber('0.0')}%)"
    });

    // Agregar una leyenda al gráfico
    let legend2 = chart2.children.push(am5.Legend.new(this.root2, {
      y: am5.percent(50),
      x: am5.percent(50),
      centerY: am5.percent(50),
      layout: this.root2.verticalLayout
    }));

    // personalizando texto leyendas Loquillo
    legend2.labels.template.setAll({
      fontSize: 14,
      fontWeight: "300"
    });
    legend2.valueLabels.template.setAll({
      fontSize: 14,
      fontWeight: "400"
    });

    // Conectar la serie a la leyenda
    legend2.data.setAll(series2.dataItems);

    // Animar la carga del gráfico
    series2.appear(1000, 100);
    }
    ngOnDestroy() {
      // Limpiar la instancia de amCharts al destruir el componente
      if (this.root2) {
        this.root2.dispose();
      }
    }
  
  
  }