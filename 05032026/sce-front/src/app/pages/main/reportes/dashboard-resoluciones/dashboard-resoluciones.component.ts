import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

@Component({
  selector: 'app-dashboard-resoluciones',
  templateUrl: './dashboard-resoluciones.component.html',
  styleUrls: ['./dashboard-resoluciones.component.scss']
})

export class DashboardResolucionesComponent implements AfterViewInit, OnDestroy {

  private root!: am5.Root;
  private root2!: am5.Root;

  ngAfterViewInit() {
    am5.addLicense("AM5C-357384425");
    // Crear raíz del gráfico
    this.root = am5.Root.new("piechartdiv");

    // Aplicar un tema
    this.root.setThemes([
      am5themes_Animated.new(this.root)
    ]);

    // Crear un gráfico de tipo Pie
    let chart = this.root.container.children.push(am5percent.PieChart.new(this.root, {
      layout: this.root.verticalLayout,
      radius: am5.percent(50)
    }));



    // Crear una serie de datos de tipo Pie
    let series = chart.series.push(am5percent.PieSeries.new(this.root, {
      valueField: "value",
      categoryField: "category",
      alignLabels: false
    }));

    // Configurar la paleta de colores personalizada
    series.slices.template.setAll({
      stroke: am5.color("#ffffff"),
      strokeWidth: 1
    })

    series.set("colors", am5.ColorSet.new(this.root, {
      colors: [
        am5.color("#80B062"), // Color para el primer segmento
        am5.color("#C54747"), // Color para el segundo segmento
        am5.color("#67B0D5")  // Color para el tercer segmento
      ],
    }));

    // Agregar datos
    series.data.setAll([
      { category: "Contabilizadas", value: 540 },
      { category: "Para envio al JEE", value: 125 },
      { category: "Por Procesar", value: 20 },
    ]);

    // Agregar etiquetas y valores dentro del gráfico
    series.labels.template.setAll({
      text: "{valuePercentTotal.formatNumber('0.0')}%",
      fontSize: 12,
      fontWeight: "600"
    });

    series.slices.template.setAll({
      tooltipText: "[fontSize: 12px]{category}: {value} ({valuePercentTotal.formatNumber('0.0')}%)",
    });

    // Agregar una leyenda al gráfico
    let legend = chart.children.push(am5.Legend.new(this.root, {
      centerX: am5.percent(50),
      x: am5.percent(50),
      layout: this.root.verticalLayout
    }));

    // personalizando texto leyendas Loquillo
    legend.labels.template.setAll({
      fontSize: 14,
      fontWeight: "300"
    });
    legend.valueLabels.template.setAll({
      fontSize: 16,
      fontWeight: "600"
    });

    // Conectar la serie a la leyenda
    legend.data.setAll(series.dataItems);







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
        am5.color("#80B062"), // Color para el primer segmento
        am5.color("#C54748"), // Color para el segundo segmento
        am5.color("#67B0D5"), // Color para el terce segmento
        am5.color("#B1B1B1"), // Color para el cuarto segmento
      ],
    }));

    // Agregar datos
    series2.data.setAll([
      { category: "Resolución procesada", value: 850 },
      { category: "Resolución Digitalizadas", value: 2125 },
      { category: "Resolución no procesada", value: 950 },
      { category: "Control de calidad", value: 425 },
    ]);

    // Agregar etiquetas y valores dentro del gráfico
    series2.labels.template.setAll({
      text: "{valuePercentTotal.formatNumber('0.0')}%",
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
      layout: this.root.verticalLayout
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
    series.appear(1000, 100);
    series2.appear(1000, 100);
  }
  ngOnDestroy() {
    // Limpiar la instancia de amCharts al destruir el componente
    if (this.root) {
      this.root.dispose();
    }
    if (this.root2) {
      this.root2.dispose();
    }
  }


}