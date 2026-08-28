import { motion, AnimatePresence } from 'framer-motion';

import ProfileCard from './ProfileCard';
import DataTable from './DataTable';
import FeedGrid from './FeedGrid';
import VideoPlayer from './VideoPlayer';
import MultiFeedView from './MultiFeedView';
import MapView from './MapView';
import EventTimeline from './EventTimeline';
import ChartPanel from './ChartPanel';

const COMPONENT_MAP = {
  ProfileCard,
  DataTable,
  FeedGrid,
  VideoPlayer,
  MultiFeedView,
  MapView,
  EventTimeline,
  ChartPanel
};

export default function WorkspaceGrid({ components, onComponentInteraction }) {
  // Helper to determine the CSS Grid col-span and row-span based on component size and row grouping
  const getGridClasses = (component, allComponents) => {
    const rowNum = component.position.row;
    const sameRowComponents = allComponents.filter(c => c.position.row === rowNum);
    const countInRow = sameRowComponents.length;

    let colSpan;
    let rowSpan;

    if (countInRow === 1) {
      colSpan = 'col-span-12';
    } else if (countInRow === 2) {
      const sizes = sameRowComponents.map(c => c.size);
      if (sizes.includes('large') && sizes.includes('small')) {
        colSpan = component.size === 'large' ? 'col-span-8' : 'col-span-4';
      } else {
        colSpan = 'col-span-6';
      }
    } else if (countInRow === 3) {
      colSpan = 'col-span-4';
    } else {
      colSpan = 'col-span-3';
    }

    if (component.size === 'large') {
      rowSpan = 'row-span-2';
    } else if (component.size === 'medium') {
      rowSpan = 'row-span-1';
    } else {
      rowSpan = 'row-span-1';
    }

    return `${colSpan} ${rowSpan}`;
  };

  return (
    <div className="workspace-grid">
      <AnimatePresence mode="popLayout">
        {components.map(comp => {
          const ComponentToRender = COMPONENT_MAP[comp.type];
          if (!ComponentToRender) return null;

          const gridClasses = getGridClasses(comp, components);

          return (
            <motion.div
              key={comp.id}
              layoutId={comp.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                layout: { type: 'spring', damping: 25, stiffness: 120 },
                opacity: { duration: 0.25 },
                scale: { duration: 0.25 }
              }}
              className={`workspace-card-wrapper ${gridClasses}`}
            >
              <div className="workspace-card-inner">
                <ComponentToRender
                  data={comp.data}
                  size={comp.size}
                  onInteraction={(action, payload) => onComponentInteraction(comp.id, action, payload)}
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
