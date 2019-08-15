import SvgIcon from '@/components/SvgIcon';
import YtoCard from '@/components/YtoCard';
import YtoPanel from '@/components/YtoPanel';
import YtoGrid from '@/components/YtoGrid';
import YtoEchart from '@/components/YtoEchart';
import YtoDate from '@/components/YtoDate';

const Yto = {
  install: function(Vue) {
    Vue.component(SvgIcon.name, SvgIcon);
    Vue.component(YtoCard.name, YtoCard);
    Vue.component(YtoPanel.name, YtoPanel);
    Vue.component(YtoGrid.name, YtoGrid);
    Vue.component(YtoEchart.name, YtoEchart);
    Vue.component(YtoDate.name, YtoDate);
  }
};
const requireAll = requireContext => requireContext.keys().map(requireContext);
const req = require.context('./SvgIcon/svg', false, /\.svg$/);
requireAll(req);

export default Yto;
