// SWAC Scrollytelling Configuration
// Step definitions only - all data is calculated from swac_data.json

const storytellingConfig = {
  // Step definitions - visualization parameters only
  steps: [
    // ========== SECTION 1: DATA OVERVIEW ==========
    {
      step: 0,
      section: 'overview',
      title: 'SWAC Publications: 1978-2025',
      visualization: {
        type: 'overview',
        dimension: 'topics',
        yearRange: null, // null means all years
        highlights: [],
        action: 'showAll'
      },
      // Data points will be calculated: total, years, average, median
      dataPoints: ['total', 'years', 'average', 'median']
    },

    // ========== SECTION 2: TEMPORAL DIMENSION - Yearly Patterns ==========
    {
      step: 1,
      section: 'temporal',
      title: 'Publication Volume: 1978-1990',
      visualization: {
        type: 'streamgraph',
        dimension: 'yearly',
        yearRange: [1978, 1990],
        highlights: [], // Will be calculated: peak year in this range
        action: 'highlightYear'
      },
      // Data points will be calculated: period, total, average, peakYear, peakCount, significantIncrease
      dataPoints: ['period', 'total', 'average', 'peakYear', 'peakCount', 'significantIncrease']
    },
    {
      step: 2,
      section: 'temporal',
      title: 'Publication Volume: 1991-2000',
      visualization: {
        type: 'streamgraph',
        dimension: 'yearly',
        yearRange: [1991, 2000],
        highlights: [],
        action: 'highlightYear'
      },
      dataPoints: ['period', 'total', 'average', 'peakYear', 'peakCount', 'significantIncrease']
    },
    {
      step: 3,
      section: 'temporal',
      title: 'Publication Volume: 2001-2010',
      visualization: {
        type: 'barchart',
        dimension: 'yearly',
        yearRange: [2001, 2010],
        highlights: [],
        action: 'highlightPeakYear'
      },
      dataPoints: ['period', 'total', 'average', 'peakYear', 'peakCount', 'significantIncrease']
    },
    {
      step: 4,
      section: 'temporal',
      title: 'Publication Volume: 2011-2020',
      visualization: {
        type: 'barchart',
        dimension: 'yearly',
        yearRange: [2011, 2020],
        highlights: [],
        action: 'highlightPeakYear'
      },
      dataPoints: ['period', 'total', 'average', 'peakYear', 'peakCount']
    },
    {
      step: 5,
      section: 'temporal',
      title: 'Publication Volume: 2021-2025',
      visualization: {
        type: 'streamgraph',
        dimension: 'yearly',
        yearRange: [2021, 2025],
        highlights: [],
        action: 'showRecent'
      },
      dataPoints: ['period', 'total', 'average']
    },

    // ========== SECTION 3: TOPIC DIMENSION - Dominance and Transitions ==========
    {
      step: 6,
      section: 'topics',
      title: 'Topic Distribution: 1978-1982',
      visualization: {
        type: 'streamgraph',
        dimension: 'topics',
        yearRange: [1978, 1982],
        highlights: [], // Will be calculated: dominant topic
        action: 'highlightDominantTopic'
      },
      // Data points will be calculated: period, dominantTopic, dominantPercentage, topTopics
      dataPoints: ['period', 'dominantTopic', 'dominantPercentage', 'topTopics']
    },
    {
      step: 7,
      section: 'topics',
      title: 'Topic Distribution: 1998-2002',
      visualization: {
        type: 'streamgraph',
        dimension: 'topics',
        yearRange: [1998, 2002],
        highlights: [], // Will be calculated: top 2-3 topics
        action: 'highlightTransition'
      },
      dataPoints: ['period', 'dominantTopic', 'dominantPercentage', 'topTopics', 'transition']
    },
    {
      step: 8,
      section: 'topics',
      title: 'Topic Distribution: 2003-2007',
      visualization: {
        type: 'streamgraph',
        dimension: 'topics',
        yearRange: [2003, 2007],
        highlights: [],
        action: 'highlightMultipleTopics'
      },
      dataPoints: ['period', 'dominantTopic', 'dominantPercentage', 'topTopics', 'transition']
    },
    {
      step: 9,
      section: 'topics',
      title: 'Topic Distribution: 2018-2022',
      visualization: {
        type: 'streamgraph',
        dimension: 'topics',
        yearRange: [2018, 2022],
        highlights: [],
        action: 'highlightDominantTopic'
      },
      dataPoints: ['period', 'dominantTopic', 'dominantPercentage', 'topTopics', 'transition']
    },
    {
      step: 10,
      section: 'topics',
      title: 'Topic Dominance by Decade',
      visualization: {
        type: 'evolution',
        dimension: 'topics',
        yearRange: null, // All years
        highlights: [], // Will be calculated: Food, Economy, Urban
        action: 'showTopicEvolution'
      },
      dataPoints: ['decades']
    },

    // ========== SECTION 4: SERIES DIMENSION - Launch and Impact ==========
    {
      step: 11,
      section: 'series',
      title: 'Series: ECOLOC',
      visualization: {
        type: 'timeline',
        dimension: 'series',
        yearRange: null, // Will be calculated from series data
        highlights: ['ECOLOC'],
        action: 'showSeriesLifecycle'
      },
      // Data points will be calculated: series, launchYear, endYear, total, yearsActive, averagePerYear
      dataPoints: ['series', 'launchYear', 'endYear', 'total', 'yearsActive', 'averagePerYear'],
      seriesName: 'ECOLOC'
    },
    {
      step: 12,
      section: 'series',
      title: 'Series: West Africa Brief',
      visualization: {
        type: 'timeline',
        dimension: 'series',
        yearRange: null,
        highlights: ['West Africa Brief'],
        action: 'showSeriesLifecycle'
      },
      dataPoints: ['series', 'launchYear', 'endYear', 'total', 'yearsActive', 'averagePerYear'],
      seriesName: 'West Africa Brief'
    },
    {
      step: 13,
      section: 'series',
      title: 'Series: Maps and Facts',
      visualization: {
        type: 'timeline',
        dimension: 'series',
        yearRange: null,
        highlights: ['Maps and Facts'],
        action: 'showSeriesLifecycle'
      },
      dataPoints: ['series', 'launchYear', 'endYear', 'total', 'yearsActive', 'averagePerYear'],
      seriesName: 'Maps and Facts'
    },
    {
      step: 14,
      section: 'series',
      title: 'Series: Africapolis',
      visualization: {
        type: 'streamgraph',
        dimension: 'series',
        yearRange: [2011, 2020], // Context years around series
        highlights: ['Africapolis'],
        action: 'highlightSeries'
      },
      dataPoints: ['series', 'launchYear', 'endYear', 'total', 'yearsActive', 'averagePerYear'],
      seriesName: 'Africapolis'
    },
    {
      step: 15,
      section: 'series',
      title: 'Top Series Comparison',
      visualization: {
        type: 'comparison',
        dimension: 'series',
        yearRange: null, // Will cover all series years
        highlights: [], // Will be calculated: top 4 series
        action: 'compareSeries'
      },
      dataPoints: ['topSeries'],
      topN: 4 // Number of top series to show
    },

    // ========== SECTION 5: TYPE DIMENSION - Document Type Evolution ==========
    {
      step: 16,
      section: 'types',
      title: 'Document Type: 1970s-1980s',
      visualization: {
        type: 'streamgraph',
        dimension: 'type',
        yearRange: [1978, 1990],
        highlights: [], // Will be calculated: dominant type
        action: 'highlightType'
      },
      dataPoints: ['period', 'dominantType', 'typeDistribution']
    },
    {
      step: 17,
      section: 'types',
      title: 'Document Type: 1990s-2020s',
      visualization: {
        type: 'streamgraph',
        dimension: 'type',
        yearRange: [1991, 2025],
        highlights: [], // Will be calculated: Report type
        action: 'highlightType'
      },
      dataPoints: ['period', 'dominantType', 'typeDistributionByDecade']
    },

    // ========== SECTION 6: STATISTICAL SUMMARY ==========
    {
      step: 18,
      section: 'summary',
      title: 'Statistical Summary',
      visualization: {
        type: 'overview',
        dimension: 'topics',
        yearRange: null,
        highlights: [],
        action: 'showSummary'
      },
      dataPoints: ['total', 'years', 'average', 'median', 'peakYear', 'peakCount', 'seriesCount', 'topicsCount', 'typesCount']
    }
  ]
};

// Data calculation functions - these will compute all statistics from swac_data.json
class StoryDataCalculator {
  constructor(data) {
    this.data = data;
    this.publications = data.publications;
    this.metadata = data.metadata;
  }

  // Calculate statistics for a step
  calculateStepData(stepConfig) {
    const step = { ...stepConfig };
    const calculatedData = {};

    // Calculate data points based on step configuration
    stepConfig.dataPoints.forEach(dataPoint => {
      switch (dataPoint) {
        case 'total':
          calculatedData.total = this.calculateTotal(stepConfig.visualization?.yearRange);
          break;
        case 'years':
          calculatedData.years = this.calculateYears(stepConfig.visualization?.yearRange);
          break;
        case 'average':
          calculatedData.average = this.calculateAverage(stepConfig.visualization?.yearRange);
          break;
        case 'median':
          calculatedData.median = this.calculateMedian();
          break;
        case 'period':
          if (stepConfig.visualization?.yearRange) {
            calculatedData.period = `${stepConfig.visualization.yearRange[0]}-${stepConfig.visualization.yearRange[1]}`;
          }
          break;
        case 'peakYear':
          calculatedData.peakYear = this.calculatePeakYear(stepConfig.visualization?.yearRange);
          break;
        case 'peakCount':
          calculatedData.peakCount = this.calculatePeakCount(stepConfig.visualization?.yearRange);
          break;
        case 'significantIncrease':
          calculatedData.significantIncrease = this.calculateSignificantIncrease(stepConfig.visualization?.yearRange);
          break;
        case 'dominantTopic':
          calculatedData.dominantTopic = this.calculateDominantTopic(stepConfig.visualization?.yearRange);
          break;
        case 'dominantPercentage':
          calculatedData.dominantPercentage = this.calculateDominantPercentage(stepConfig.visualization?.yearRange);
          break;
        case 'topTopics':
          calculatedData.topTopics = this.calculateTopTopics(stepConfig.visualization?.yearRange, 3);
          break;
        case 'transition':
          calculatedData.transition = this.calculateTransition(stepConfig.visualization?.yearRange);
          break;
        case 'decades':
          calculatedData.decades = this.calculateDecadeDominance();
          break;
        case 'series':
          if (stepConfig.seriesName) {
            const seriesData = this.calculateSeriesData(stepConfig.seriesName);
            Object.assign(calculatedData, seriesData);
          }
          break;
        case 'launchYear':
        case 'endYear':
        case 'yearsActive':
        case 'averagePerYear':
          // These are calculated in calculateSeriesData
          break;
        case 'topSeries':
          calculatedData.topSeries = this.calculateTopSeries(stepConfig.topN || 4);
          break;
        case 'dominantType':
          calculatedData.dominantType = this.calculateDominantType(stepConfig.visualization?.yearRange);
          break;
        case 'typeDistribution':
          calculatedData.typeDistribution = this.calculateTypeDistribution(stepConfig.visualization?.yearRange);
          break;
        case 'typeDistributionByDecade':
          calculatedData.typeDistributionByDecade = this.calculateTypeDistributionByDecade();
          break;
        case 'seriesCount':
          calculatedData.seriesCount = this.metadata.series_count;
          break;
        case 'topicsCount':
          calculatedData.topicsCount = this.metadata.topics.length;
          break;
        case 'typesCount':
          calculatedData.typesCount = this.metadata.types_count;
          break;
      }
    });

    // Update highlights based on calculated data
    if (calculatedData.peakYear && stepConfig.visualization.action === 'highlightYear') {
      step.visualization.highlights = [calculatedData.peakYear];
    }
    if (calculatedData.dominantTopic && stepConfig.visualization.action === 'highlightDominantTopic') {
      step.visualization.highlights = [calculatedData.dominantTopic];
    }
    if (calculatedData.topTopics && stepConfig.visualization.action === 'highlightMultipleTopics') {
      step.visualization.highlights = calculatedData.topTopics.slice(0, 2).map(t => t.topic);
    }

    // Update yearRange for series
    if (stepConfig.seriesName && calculatedData.launchYear && calculatedData.endYear) {
      step.visualization.yearRange = [calculatedData.launchYear, calculatedData.endYear];
    }

    // Update highlights for top series comparison
    if (calculatedData.topSeries && stepConfig.visualization.action === 'compareSeries') {
      step.visualization.highlights = calculatedData.topSeries.map(s => s.series);
    }

    step.calculatedData = calculatedData;
    return step;
  }

  // Calculation helper methods
  calculateTotal(yearRange = null) {
    if (yearRange) {
      // Filter by year range and return count for that range
      const pubs = this.filterByYearRange(yearRange);
      return pubs.length;
    }
    // Return total for all years
    return this.metadata.total_publications;
  }

  calculateYears(yearRange = null) {
    if (yearRange) {
      // Return number of years in the specified range
      return yearRange[1] - yearRange[0] + 1;
    }
    // Return total years across all data
    return this.metadata.year_range.max - this.metadata.year_range.min + 1;
  }

  calculateAverage(yearRange = null) {
    const pubs = this.filterByYearRange(yearRange);
    if (!pubs.length) return 0;
    const years = yearRange ? yearRange[1] - yearRange[0] + 1 : this.calculateYears();
    return (pubs.length / years).toFixed(1);
  }

  calculateMedian() {
    const yearCounts = this.getYearlyCounts();
    const counts = Object.values(yearCounts).sort((a, b) => a - b);
    const mid = Math.floor(counts.length / 2);
    return counts.length % 2 === 0 
      ? ((counts[mid - 1] + counts[mid]) / 2).toFixed(1)
      : counts[mid].toFixed(1);
  }

  calculatePeakYear(yearRange = null) {
    const yearCounts = this.getYearlyCounts(yearRange);
    if (!Object.keys(yearCounts).length) return null;
    return parseInt(Object.entries(yearCounts).reduce((a, b) => yearCounts[a[0]] > yearCounts[b[0]] ? a : b)[0]);
  }

  calculatePeakCount(yearRange = null) {
    const peakYear = this.calculatePeakYear(yearRange);
    if (!peakYear) return null;
    const yearCounts = this.getYearlyCounts(yearRange);
    return yearCounts[peakYear];
  }

  calculateSignificantIncrease(yearRange = null) {
    const yearCounts = this.getYearlyCounts(yearRange);
    const years = Object.keys(yearCounts).map(Number).sort((a, b) => a - b);
    let maxIncrease = null;
    let maxIncreaseYear = null;

    for (let i = 1; i < years.length; i++) {
      const prevCount = yearCounts[years[i - 1]] || 0;
      const currCount = yearCounts[years[i]] || 0;
      if (prevCount === 0) continue;

      const change = currCount - prevCount;
      const changePct = (change / prevCount) * 100;

      // Significant if >50% increase or >20 publications increase
      if ((changePct > 50 || change > 20) && (!maxIncrease || changePct > maxIncrease.changePct)) {
        maxIncrease = { year: years[i], change, changePct: changePct.toFixed(1) };
        maxIncreaseYear = years[i];
      }
    }

    return maxIncrease;
  }

  calculateDominantTopic(yearRange = null) {
    const topicCounts = this.getTopicCounts(yearRange);
    if (!Object.keys(topicCounts).length) return null;
    return Object.entries(topicCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }

  calculateDominantPercentage(yearRange = null) {
    const topicCounts = this.getTopicCounts(yearRange);
    const total = Object.values(topicCounts).reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    const dominant = this.calculateDominantTopic(yearRange);
    return ((topicCounts[dominant] / total) * 100).toFixed(1);
  }

  calculateTopTopics(yearRange = null, n = 3) {
    const topicCounts = this.getTopicCounts(yearRange);
    const total = Object.values(topicCounts).reduce((a, b) => a + b, 0);
    return Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([topic, count]) => ({
        topic,
        count,
        percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0
      }));
  }

  calculateTransition(yearRange = null) {
    if (!yearRange) return null;
    const [startYear, endYear] = yearRange;
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    
    let prevDominant = null;
    for (const year of years) {
      const dominant = this.calculateDominantTopic([year, year]);
      if (prevDominant && dominant !== prevDominant) {
        return { year, from: prevDominant, to: dominant };
      }
      prevDominant = dominant;
    }
    return null;
  }

  calculateDecadeDominance() {
    const decades = {};
    for (let decade = 1970; decade <= 2020; decade += 10) {
      const yearRange = [decade, Math.min(decade + 9, this.metadata.year_range.max)];
      const dominant = this.calculateDominantTopic(yearRange);
      const percentage = parseFloat(this.calculateDominantPercentage(yearRange));
      decades[`${decade}s`] = { topic: dominant, percentage };
    }
    return decades;
  }

  calculateSeriesData(seriesName) {
    const seriesPubs = this.publications.filter(p => p.series === seriesName);
    if (!seriesPubs.length) return null;

    const years = seriesPubs.map(p => p.year).sort((a, b) => a - b);
    const launchYear = years[0];
    const endYear = years[years.length - 1];
    const yearsActive = endYear - launchYear + 1;
    const total = seriesPubs.length;
    const averagePerYear = (total / yearsActive).toFixed(1);

    return {
      series: seriesName,
      launchYear,
      endYear,
      total,
      yearsActive,
      averagePerYear: parseFloat(averagePerYear)
    };
  }

  calculateTopSeries(n = 4) {
    const seriesCounts = {};
    const seriesFirstYear = {};

    this.publications.forEach(pub => {
      const series = pub.series;
      if (!series) return;

      seriesCounts[series] = (seriesCounts[series] || 0) + 1;
      if (!seriesFirstYear[series] || pub.year < seriesFirstYear[series]) {
        seriesFirstYear[series] = pub.year;
      }
    });

    return Object.entries(seriesCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([series, count]) => ({
        series,
        count,
        launchYear: seriesFirstYear[series]
      }));
  }

  calculateDominantType(yearRange = null) {
    const typeCounts = this.getTypeCounts(yearRange);
    if (!Object.keys(typeCounts).length) return null;
    return Object.entries(typeCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }

  calculateTypeDistribution(yearRange = null) {
    return this.getTypeCounts(yearRange);
  }

  calculateTypeDistributionByDecade() {
    const distribution = {};
    for (let decade = 1970; decade <= 2020; decade += 10) {
      const yearRange = [decade, Math.min(decade + 9, this.metadata.year_range.max)];
      const typeCounts = this.getTypeCounts(yearRange);
      const dominant = Object.entries(typeCounts).reduce((a, b) => a[1] > b[1] ? a : b, [null, 0]);
      distribution[`${decade}s`] = {
        type: dominant[0],
        count: dominant[1]
      };
    }
    return distribution;
  }

  // Helper methods
  filterByYearRange(yearRange) {
    if (!yearRange) return this.publications;
    const [start, end] = yearRange;
    return this.publications.filter(p => p.year >= start && p.year <= end);
  }

  getYearlyCounts(yearRange = null) {
    const pubs = this.filterByYearRange(yearRange);
    const counts = {};
    pubs.forEach(pub => {
      counts[pub.year] = (counts[pub.year] || 0) + 1;
    });
    return counts;
  }

  getTopicCounts(yearRange = null) {
    const pubs = this.filterByYearRange(yearRange);
    const counts = {};
    pubs.forEach(pub => {
      (pub.topics || []).forEach(topic => {
        counts[topic] = (counts[topic] || 0) + 1;
      });
    });
    return counts;
  }

  getTypeCounts(yearRange = null) {
    const pubs = this.filterByYearRange(yearRange);
    const counts = {};
    pubs.forEach(pub => {
      if (pub.type) {
        counts[pub.type] = (counts[pub.type] || 0) + 1;
      }
    });
    return counts;
  }
}

// Export for Node.js (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { storytellingConfig, StoryDataCalculator };
}

// Make available globally for browser
if (typeof window !== 'undefined') {
  window.storytellingConfig = storytellingConfig;
  window.StoryDataCalculator = StoryDataCalculator;
}
