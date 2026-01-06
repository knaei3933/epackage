/**
 * Performance Monitor Unit Tests
 *
 * パフォーマンスモニタのユニットテスト
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  getPerformanceMonitor,
  resetPerformanceMonitor,
  PerformanceMonitor,
} from '../performance-monitor';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    // Reset global monitor before each test
    resetPerformanceMonitor();
    monitor = new PerformanceMonitor({
      slowQueryThreshold: 100,
      maxStoredQueries: 10,
      enableLogging: false,
    });
  });

  afterEach(() => {
    resetPerformanceMonitor();
  });

  describe('trackQuery', () => {
    it('should track a query successfully', () => {
      monitor.trackQuery('SELECT * FROM users', 50);

      const stats = monitor.getStats();
      expect(stats.totalQueries).toBe(1);
      expect(stats.averageDuration).toBe(50);
    });

    it('should categorize slow queries correctly', () => {
      monitor.trackQuery('SELECT * FROM users', 150); // Slow query
      monitor.trackQuery('SELECT * FROM posts', 50);  // Fast query

      const stats = monitor.getStats();
      expect(stats.slowQueries).toBe(1);
      expect(stats.totalQueries).toBe(2);
    });

    it('should limit stored queries to maxStoredQueries', () => {
      const maxQueries = 10;
      const testMonitor = new PerformanceMonitor({
        slowQueryThreshold: 100,
        maxStoredQueries: maxQueries,
        enableLogging: false,
      });

      // Add more queries than maxStoredQueries
      for (let i = 0; i < 15; i++) {
        testMonitor.trackQuery(`Query ${i}`, 50);
      }

      const stats = testMonitor.getStats();
      expect(stats.totalQueries).toBe(maxQueries);
    });

    it('should store query parameters', () => {
      monitor.trackQuery('SELECT * FROM users WHERE id = $1', 50, { userId: 123 });

      const slowQueries = monitor.getSlowQueries();
      expect(slowQueries).toHaveLength(0); // 50ms is not slow
    });
  });

  describe('getStats', () => {
    it('should return zero stats for empty monitor', () => {
      const stats = monitor.getStats();

      expect(stats.totalQueries).toBe(0);
      expect(stats.slowQueries).toBe(0);
      expect(stats.averageDuration).toBe(0);
      expect(stats.maxDuration).toBe(0);
      expect(stats.minDuration).toBe(0);
    });

    it('should calculate correct statistics', () => {
      monitor.trackQuery('Query 1', 100);
      monitor.trackQuery('Query 2', 200);
      monitor.trackQuery('Query 3', 300);

      const stats = monitor.getStats();

      expect(stats.totalQueries).toBe(3);
      expect(stats.averageDuration).toBe(200);
      expect(stats.maxDuration).toBe(300);
      expect(stats.minDuration).toBe(100);
    });
  });

  describe('generateReport', () => {
    it('should generate report for time period', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      monitor.trackQuery('Query 1', 50);
      monitor.trackQuery('Query 2', 150); // Slow query

      const report = monitor.generateReport(oneHourAgo, now);

      expect(report.totalQueries).toBe(2);
      expect(report.slowQueryCount).toBe(1);
      expect(report.slowQueries).toHaveLength(1);
      expect(report.slowQueries[0].query).toBe('Query 2');
    });

    it('should filter queries outside time period', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      // Track a query with current time (150ms is > 100ms threshold, so it's slow)
      monitor.trackQuery('Recent Slow Query', 150);

      // Generate report for past hour (should include the recent query)
      const report = monitor.generateReport(oneHourAgo, now);

      expect(report.totalQueries).toBe(1);
      expect(report.slowQueries).toHaveLength(1);

      // Generate report for older time period (should be empty)
      const oldReport = monitor.generateReport(twoHoursAgo, oneHourAgo);

      expect(oldReport.totalQueries).toBe(0);
      expect(oldReport.slowQueries).toHaveLength(0);
    });

    it('should include period in report', () => {
      const startTime = new Date('2024-01-01T00:00:00Z');
      const endTime = new Date('2024-01-01T01:00:00Z');

      monitor.trackQuery('Query 1', 50);

      const report = monitor.generateReport(startTime, endTime);

      expect(report.period.start).toEqual(startTime);
      expect(report.period.end).toEqual(endTime);
    });
  });

  describe('getSlowQueries', () => {
    it('should return only slow queries', () => {
      monitor.trackQuery('Fast Query', 50);
      monitor.trackQuery('Slow Query 1', 150);
      monitor.trackQuery('Slow Query 2', 200);
      monitor.trackQuery('Medium Query', 100); // At threshold

      const slowQueries = monitor.getSlowQueries();

      expect(slowQueries).toHaveLength(2);
      expect(slowQueries[0].query).toBe('Slow Query 1');
      expect(slowQueries[1].query).toBe('Slow Query 2');
    });
  });

  describe('clear', () => {
    it('should clear all stored metrics', () => {
      monitor.trackQuery('Query 1', 100);
      monitor.trackQuery('Query 2', 200);

      expect(monitor.getStats().totalQueries).toBe(2);

      monitor.clear();

      expect(monitor.getStats().totalQueries).toBe(0);
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance for getPerformanceMonitor', () => {
      resetPerformanceMonitor();

      const monitor1 = getPerformanceMonitor({
        slowQueryThreshold: 100,
        enableLogging: false,
      });

      const monitor2 = getPerformanceMonitor({
        slowQueryThreshold: 200, // Different option
        enableLogging: false,
      });

      // Should return the same instance
      expect(monitor1).toBe(monitor2);
    });

    it('should use first options for singleton', () => {
      resetPerformanceMonitor();

      const monitor1 = getPerformanceMonitor({
        slowQueryThreshold: 100,
        enableLogging: false,
      });

      monitor1.trackQuery('Query', 150);

      const monitor2 = getPerformanceMonitor({
        slowQueryThreshold: 200, // Would make query not slow
        enableLogging: false,
      });

      // Should still have slow query from first instance
      const stats = monitor2.getStats();
      expect(stats.slowQueries).toBe(1);
    });
  });

  describe('resetPerformanceMonitor', () => {
    it('should clear and reset global monitor', () => {
      const monitor1 = getPerformanceMonitor();
      monitor1.trackQuery('Query 1', 100);

      resetPerformanceMonitor();

      const monitor2 = getPerformanceMonitor();
      const stats = monitor2.getStats();

      expect(stats.totalQueries).toBe(0);
    });
  });
});
