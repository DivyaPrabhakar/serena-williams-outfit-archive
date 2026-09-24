import PanelHeader from './PanelHeader'

// Shared right-side overlay shell used by every "pick an option" panel
// (Group by, Layout, Size, Missing outfits). All of them get the same header,
// border, width and scroll behavior from one place instead of each panel
// hand-rolling its own copy.
export default function SidePanel({ title, onClose, closeLabel, closeIcon, bodyClassName = 'px-5 py-5', children }) {
  return (
    <div className="fixed right-0 top-28 bottom-0 z-[45] w-full sm:w-72 bg-dark2 border-l-2 border-white shadow-2xl flex flex-col">
      <PanelHeader title={title} onClose={onClose} closeLabel={closeLabel} closeIcon={closeIcon} />
      <div className={`flex-1 overflow-y-auto ${bodyClassName}`}>
        {children}
      </div>
    </div>
  )
}
