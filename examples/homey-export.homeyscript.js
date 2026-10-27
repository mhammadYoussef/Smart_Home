// Run inside HomeyScript, not Node or the dashboard.
// Read-only capability export. Configure YOUR device IDs privately below.
// Copy the returned JSON into a local readings.json file, then import it.
// This example is not an automatic connection or authentication integration.
const selection = [
  // { metric: 'outdoor', deviceId: 'YOUR_DEVICE_ID', capability: 'measure_temperature' },
  // { metric: 'siteLoad', deviceId: 'YOUR_SITE_METER', capability: 'measure_power' },
  // { metric: 'garage', deviceId: 'YOUR_GARAGE_METER', capability: 'measure_power' },
];
if (!selection.length) throw new Error('Choose your own devices and capabilities in selection first.');
const devices = await Homey.devices.getDevices();
const now = Date.now(), values = {}, timestamps = {};
for (const item of selection) {
  const device = devices[item.deviceId];
  const capability = device?.capabilitiesObj?.[item.capability];
  const at = Date.parse(capability?.lastUpdated);
  const fresh = device?.available !== false && Number.isFinite(at)
    && now - at >= 0 && now - at <= 90000;
  values[item.metric] = fresh && Number.isFinite(capability?.value) ? capability.value : null;
  timestamps[item.metric] = at;
}
// Only retain the building split when source meter times are aligned.
if (selection.some(x => x.metric === 'siteLoad') && selection.some(x => x.metric === 'garage')
    && (!Number.isFinite(timestamps.siteLoad) || !Number.isFinite(timestamps.garage)
        || Math.abs(timestamps.siteLoad - timestamps.garage) > 30000)) {
  values.garage = null;
}
return JSON.stringify({schemaVersion:1,source:'My Homey export',samples:[{
  at:new Date(now).toISOString(),values
}]},null,2);
