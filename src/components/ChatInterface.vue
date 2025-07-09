<script setup lang="ts">
import { QScrollArea } from 'quasar';
import { ref, computed, onMounted } from 'vue';
import ollama from 'ollama/browser';
import VegaLite from './VegaLite.vue';
import DSLVis from './DSLVis.vue';
import DSLVisFunc from './DSLVisFunc.vue';
import { type Message, useConversationStore } from './conversationStore';
import { interstitialPrompt, tools as agentTools } from './promptEngineering';
import type { ToolCall } from 'ollama';
// import { UDIVis } from 'udi-toolkit';
import OpenAI from 'openai';

const conversationStore = useConversationStore();
const inputText = ref('');

const messageArea = ref<InstanceType<typeof QScrollArea> | null>(null);

const llmResponding = ref(false);

const client = { value: null };

onMounted(() => {
  // apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted

  // # Modify OpenAI's API key and API base to use vLLM's API server.
  // openai_api_key = "EMPTY"
  // openai_api_base = "http://localhost:8000/v1"
  // client = OpenAI(
  //     api_key=openai_api_key,
  //     base_url=openai_api_base,
  // )

  client.value = new OpenAI({
    baseURL: 'http://localhost:9090/v1', // vLLM API server
    apiKey: 'EMPTY', // Replace with your OpenAI API key if needed
    dangerouslyAllowBrowser: true,
  });
});

function sendMessage(event: Event) {
  if (event instanceof KeyboardEvent && event.shiftKey) {
    return;
  }
  event.preventDefault();
  if (llmResponding.value) {
    // don't allow double sending
    return;
  }

  if (interstitialPrompt) {
    conversationStore.messages.push({
      role: 'system',
      content: interstitialPrompt,
    });
  }

  conversationStore.messages.push({ content: inputText.value, role: 'user' });
  inputText.value = '';
  void queryLLM();
  scrollToBottom();
}

async function testOpenAI() {
  const server = 'http://localhost:9090/v1';
  const model = 'agenticx/UDI-VIS-Beta-v0-Llama-3.1-8B';
  // const messages = [
  //   { role: 'user', content: 'Write a one-sentence bedtime story about a platypus.' },
  // ];

  const messages = [
    {
      content:
        'You are a helpful assistant that will explore, and analyze datasets with visualizations. The following defines the available datasets:\n{\n"name": "hubmap",\n"schema": [\n{\n"name": "datasets",\n"folder": "hubmap",\n"url": "./data/hubmap/datasets.csv",\n"row_count": 3235,\n"column_count": 176,\n"columns": [\n{\n"name": "uuid",\n"data_type": "nominal",\n"cardinality": 3235\n},\n{\n"name": "hubmap_id",\n"data_type": "nominal",\n"cardinality": 3235\n},\n{\n"name": "ablation_distance_between_shots_x_units",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "ablation_distance_between_shots_x_value",\n"data_type": "quantitative",\n"cardinality": 2\n},\n{\n"name": "ablation_distance_between_shots_y_units",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "ablation_distance_between_shots_y_value",\n"data_type": "quantitative",\n"cardinality": 2\n},\n{\n"name": "ablation_frequency_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "ablation_frequency_value",\n"data_type": "quantitative",\n"cardinality": 3\n},\n{\n"name": "acquisition_id",\n"data_type": "nominal",\n"cardinality": 218\n},\n{\n"name": "acquisition_instrument_model",\n"data_type": "nominal",\n"cardinality": 47\n},\n{\n"name": "acquisition_instrument_vendor",\n"data_type": "nominal",\n"cardinality": 19\n},\n{\n"name": "analyte_class",\n"data_type": "nominal",\n"cardinality": 10\n},\n{\n"name": "area_normalized_ion_dose_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "area_normalized_ion_dose_value",\n"data_type": "quantitative",\n"cardinality": 2\n},\n{\n"name": "assay_category",\n"data_type": "nominal",\n"cardinality": 5\n},\n{\n"name": "assay_type",\n"data_type": "nominal",\n"cardinality": 37\n},\n{\n"name": "bead_barcode_offset",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "bead_barcode_read",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "bead_barcode_size",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "bulk_atac_cell_isolation_protocols_io_doi",\n"data_type": "nominal",\n"cardinality": 3\n},\n{\n"name": "bulk_rna_isolation_protocols_io_doi",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "bulk_rna_isolation_quality_metric_value",\n"data_type": "quantitative",\n"cardinality": 7\n},\n{\n"name": "bulk_rna_yield_units_per_tissue_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "bulk_rna_yield_value",\n"data_type": "quantitative",\n"cardinality": 9\n},\n{\n"name": "bulk_transposition_input_number_nuclei",\n"data_type": "quantitative",\n"cardinality": 2\n},\n{\n"name": "cell_barcode_offset",\n"data_type": "nominal",\n"cardinality": 6\n},\n{\n"name": "cell_barcode_read",\n"data_type": "nominal",\n"cardinality": 19\n},\n{\n"name": "cell_barcode_size",\n"data_type": "nominal",\n"cardinality": 6\n},\n{\n"name": "created_by_user_displayname",\n"data_type": "nominal",\n"cardinality": 22\n},\n{\n"name": "created_by_user_email",\n"data_type": "nominal",\n"cardinality": 24\n},\n{\n"name": "created_timestamp",\n"data_type": "quantitative",\n"cardinality": 3234\n},\n{\n"name": "data_collection_mode",\n"data_type": "nominal",\n"cardinality": 4\n},\n{\n"name": "data_precision_bytes",\n"data_type": "quantitative",\n"cardinality": 3\n},\n{\n"name": "description",\n"data_type": "nominal",\n"cardinality": 245\n},\n{\n"name": "desi_solvent",\n"data_type": "nominal",\n"cardinality": 4\n},\n{\n"name": "desi_solvent_flow_rate",\n"data_type": "quantitative",\n"cardinality": 4\n},\n{\n"name": "desi_solvent_flow_rate_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "dms",\n"data_type": "nominal",\n"cardinality": 3\n},\n{\n"name": "dna_assay_input_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "dna_assay_input_value",\n"data_type": "quantitative",\n"cardinality": 3\n},\n{\n"name": "donor.hubmap_id",\n"data_type": "nominal",\n"cardinality": 266\n},\n{\n"name": "dual_count_start",\n"data_type": "quantitative",\n"cardinality": 3\n},\n{\n"name": "end_datetime",\n"data_type": "nominal",\n"cardinality": 15\n},\n{\n"name": "execution_datetime",\n"data_type": "nominal",\n"cardinality": 517\n},\n{\n"name": "expected_cell_count",\n"data_type": "quantitative",\n"cardinality": 18\n},\n{\n"name": "gdna_fragmentation_quality_assurance",\n"data_type": "nominal",\n"cardinality": 3\n},\n{\n"name": "group_name",\n"data_type": "nominal",\n"cardinality": 19\n},\n{\n"name": "increment_z_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "increment_z_value",\n"data_type": "quantitative",\n"cardinality": 3\n},\n{\n"name": "ion_mobility",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "is_targeted",\n"data_type": "nominal",\n"cardinality": 3\n},\n{\n"name": "is_technical_replicate",\n"data_type": "nominal",\n"cardinality": 3\n},\n{\n"name": "labeling",\n"data_type": "nominal",\n"cardinality": 8\n},\n{\n"name": "last_modified_timestamp",\n"data_type": "quantitative",\n"cardinality": 3235\n},\n{\n"name": "lc_column_model",\n"data_type": "nominal",\n"cardinality": 9\n},\n{\n"name": "lc_column_vendor",\n"data_type": "nominal",\n"cardinality": 7\n},\n{\n"name": "lc_flow_rate_unit",\n"data_type": "nominal",\n"cardinality": 3\n},\n{\n"name": "lc_flow_rate_value",\n"data_type": "quantitative",\n"cardinality": 7\n},\n{\n"name": "lc_gradient",\n"data_type": "nominal",\n"cardinality": 9\n},\n{\n"name": "lc_id_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "lc_id_value",\n"data_type": "quantitative",\n"cardinality": 4\n},\n{\n"name": "lc_instrument_model",\n"data_type": "nominal",\n"cardinality": 10\n},\n{\n"name": "lc_instrument_vendor",\n"data_type": "nominal",\n"cardinality": 8\n},\n{\n"name": "lc_length_unit",\n"data_type": "nominal",\n"cardinality": 3\n},\n{\n"name": "lc_length_value",\n"data_type": "quantitative",\n"cardinality": 6\n},\n{\n"name": "lc_mobile_phase_a",\n"data_type": "nominal",\n"cardinality": 9\n},\n{\n"name": "lc_mobile_phase_b",\n"data_type": "nominal",\n"cardinality": 9\n},\n{\n"name": "lc_resin",\n"data_type": "nominal",\n"cardinality": 9\n},\n{\n"name": "lc_temp_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "lc_temp_value",\n"data_type": "quantitative",\n"cardinality": 7\n},\n{\n"name": "library_adapter_sequence",\n"data_type": "nominal",\n"cardinality": 25\n},\n{\n"name": "library_average_fragment_size",\n"data_type": "quantitative",\n"cardinality": 160\n},\n{\n"name": "library_concentration_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "library_concentration_value",\n"data_type": "quantitative",\n"cardinality": 23\n},\n{\n"name": "library_construction_method",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "library_construction_protocols_io_doi",\n"data_type": "nominal",\n"cardinality": 19\n},\n{\n"name": "library_creation_date",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "library_final_yield",\n"data_type": "quantitative",\n"cardinality": 56\n},\n{\n"name": "library_final_yield_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "library_final_yield_value",\n"data_type": "quantitative",\n"cardinality": 226\n},\n{\n"name": "library_id",\n"data_type": "nominal",\n"cardinality": 402\n},\n{\n"name": "library_layout",\n"data_type": "nominal",\n"cardinality": 3\n},\n{\n"name": "library_pcr_cycles",\n"data_type": "quantitative",\n"cardinality": 13\n},\n{\n"name": "library_pcr_cycles_for_sample_index",\n"data_type": "quantitative",\n"cardinality": 11\n},\n{\n"name": "library_preparation_kit",\n"data_type": "nominal",\n"cardinality": 3\n},\n{\n"name": "mapped_consortium",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "mapped_statusdata_access_level",\n"data_type": "quantitative",\n"cardinality": 1\n},\n{\n"name": "mass_resolving_power",\n"data_type": "quantitative",\n"cardinality": 8\n},\n{\n"name": "max_x_width_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "max_x_width_value",\n"data_type": "quantitative",\n"cardinality": 3\n},\n{\n"name": "max_y_height_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "max_y_height_value",\n"data_type": "quantitative",\n"cardinality": 3\n},\n{\n"name": "ms_scan_mode",\n"data_type": "nominal",\n"cardinality": 6\n},\n{\n"name": "ms_source",\n"data_type": "nominal",\n"cardinality": 7\n},\n{\n"name": "mz_range_high_value",\n"data_type": "quantitative",\n"cardinality": 8\n},\n{\n"name": "mz_range_low_value",\n"data_type": "quantitative",\n"cardinality": 11\n},\n{\n"name": "mz_resolving_power",\n"data_type": "quantitative",\n"cardinality": 7\n},\n{\n"name": "number_of_antibodies",\n"data_type": "quantitative",\n"cardinality": 8\n},\n{\n"name": "number_of_barcode_probes",\n"data_type": "quantitative",\n"cardinality": 3\n},\n{\n"name": "number_of_barcode_regions_per_barcode_probe",\n"data_type": "quantitative",\n"cardinality": 3\n},\n{\n"name": "number_of_channels",\n"data_type": "quantitative",\n"cardinality": 7\n},\n{\n"name": "number_of_cycles",\n"data_type": "quantitative",\n"cardinality": 11\n},\n{\n"name": "number_of_imaging_rounds",\n"data_type": "quantitative",\n"cardinality": 2\n},\n{\n"name": "number_of_pseudocolors_per_channel",\n"data_type": "quantitative",\n"cardinality": 2\n},\n{\n"name": "number_of_readout_probes_per_channel",\n"data_type": "quantitative",\n"cardinality": 2\n},\n{\n"name": "number_of_sections",\n"data_type": "quantitative",\n"cardinality": 4\n},\n{\n"name": "operator",\n"data_type": "nominal",\n"cardinality": 45\n},\n{\n"name": "operator_email",\n"data_type": "nominal",\n"cardinality": 43\n},\n{\n"name": "origin_samples_unique_mapped_organs",\n"data_type": "nominal",\n"cardinality": 25\n},\n{\n"name": "overall_protocols_io_doi",\n"data_type": "nominal",\n"cardinality": 16\n},\n{\n"name": "pi",\n"data_type": "nominal",\n"cardinality": 26\n},\n{\n"name": "pi_email",\n"data_type": "nominal",\n"cardinality": 23\n},\n{\n"name": "pixel_dwell_time_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "pixel_dwell_time_value",\n"data_type": "quantitative",\n"cardinality": 2\n},\n{\n"name": "pixel_size_x_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "pixel_size_x_value",\n"data_type": "quantitative",\n"cardinality": 2\n},\n{\n"name": "pixel_size_y_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "pixel_size_y_value",\n"data_type": "quantitative",\n"cardinality": 2\n},\n{\n"name": "polarity",\n"data_type": "nominal",\n"cardinality": 9\n},\n{\n"name": "preparation_instrument_model",\n"data_type": "nominal",\n"cardinality": 9\n},\n{\n"name": "preparation_instrument_vendor",\n"data_type": "nominal",\n"cardinality": 7\n},\n{\n"name": "preparation_maldi_matrix",\n"data_type": "nominal",\n"cardinality": 3\n},\n{\n"name": "preparation_type",\n"data_type": "nominal",\n"cardinality": 4\n},\n{\n"name": "primary_ion",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "primary_ion_current_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "primary_ion_current_value",\n"data_type": "quantitative",\n"cardinality": 2\n},\n{\n"name": "processing_protocols_io_doi",\n"data_type": "nominal",\n"cardinality": 10\n},\n{\n"name": "processing_search",\n"data_type": "nominal",\n"cardinality": 9\n},\n{\n"name": "protocols_io_doi",\n"data_type": "nominal",\n"cardinality": 45\n},\n{\n"name": "published_timestamp",\n"data_type": "quantitative",\n"cardinality": 3216\n},\n{\n"name": "puck_id",\n"data_type": "nominal",\n"cardinality": 43\n},\n{\n"name": "range_z_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "range_z_value",\n"data_type": "quantitative",\n"cardinality": 4\n},\n{\n"name": "reagent_prep_protocols_io_doi",\n"data_type": "nominal",\n"cardinality": 8\n},\n{\n"name": "resolution_x_unit",\n"data_type": "nominal",\n"cardinality": 3\n},\n{\n"name": "resolution_x_value",\n"data_type": "quantitative",\n"cardinality": 21\n},\n{\n"name": "resolution_y_unit",\n"data_type": "nominal",\n"cardinality": 3\n},\n{\n"name": "resolution_y_value",\n"data_type": "quantitative",\n"cardinality": 21\n},\n{\n"name": "resolution_z_unit",\n"data_type": "nominal",\n"cardinality": 3\n},\n{\n"name": "resolution_z_value",\n"data_type": "quantitative",\n"cardinality": 6\n},\n{\n"name": "rnaseq_assay_input",\n"data_type": "quantitative",\n"cardinality": 120\n},\n{\n"name": "rnaseq_assay_input_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "rnaseq_assay_input_value",\n"data_type": "quantitative",\n"cardinality": 2\n},\n{\n"name": "rnaseq_assay_method",\n"data_type": "nominal",\n"cardinality": 24\n},\n{\n"name": "roi_description",\n"data_type": "nominal",\n"cardinality": 18\n},\n{\n"name": "roi_id",\n"data_type": "quantitative",\n"cardinality": 7\n},\n{\n"name": "sample_quality_metric",\n"data_type": "nominal",\n"cardinality": 3\n},\n{\n"name": "sc_isolation_cell_number",\n"data_type": "quantitative",\n"cardinality": 188\n},\n{\n"name": "sc_isolation_enrichment",\n"data_type": "nominal",\n"cardinality": 4\n},\n{\n"name": "sc_isolation_entity",\n"data_type": "nominal",\n"cardinality": 6\n},\n{\n"name": "sc_isolation_protocols_io_doi",\n"data_type": "nominal",\n"cardinality": 18\n},\n{\n"name": "sc_isolation_quality_metric",\n"data_type": "nominal",\n"cardinality": 5\n},\n{\n"name": "sc_isolation_tissue_dissociation",\n"data_type": "nominal",\n"cardinality": 8\n},\n{\n"name": "section_prep_protocols_io_doi",\n"data_type": "nominal",\n"cardinality": 23\n},\n{\n"name": "segment_data_format",\n"data_type": "nominal",\n"cardinality": 3\n},\n{\n"name": "sequencing_phix_percent",\n"data_type": "quantitative",\n"cardinality": 6\n},\n{\n"name": "sequencing_read_format",\n"data_type": "nominal",\n"cardinality": 23\n},\n{\n"name": "sequencing_read_percent_q30",\n"data_type": "quantitative",\n"cardinality": 257\n},\n{\n"name": "sequencing_reagent_kit",\n"data_type": "nominal",\n"cardinality": 22\n},\n{\n"name": "signal_type",\n"data_type": "nominal",\n"cardinality": 3\n},\n{\n"name": "source_project",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "spatial_sampling_type",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "spatial_target",\n"data_type": "nominal",\n"cardinality": 3\n},\n{\n"name": "spatial_type",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "stain",\n"data_type": "nominal",\n"cardinality": 3\n},\n{\n"name": "start_datetime",\n"data_type": "nominal",\n"cardinality": 15\n},\n{\n"name": "status",\n"data_type": "nominal",\n"cardinality": 1\n},\n{\n"name": "step_z_value",\n"data_type": "quantitative",\n"cardinality": 4\n},\n{\n"name": "thumbnail_file_abs_path",\n"data_type": "nominal",\n"cardinality": 30\n},\n{\n"name": "transposition_input",\n"data_type": "quantitative",\n"cardinality": 67\n},\n{\n"name": "transposition_kit_number",\n"data_type": "nominal",\n"cardinality": 8\n},\n{\n"name": "transposition_method",\n"data_type": "nominal",\n"cardinality": 6\n},\n{\n"name": "transposition_transposase_source",\n"data_type": "nominal",\n"cardinality": 6\n},\n{\n"name": "umi_offset",\n"data_type": "quantitative",\n"cardinality": 2\n},\n{\n"name": "umi_read",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "umi_size",\n"data_type": "quantitative",\n"cardinality": 2\n}\n],\n"relationships": {\n"donors": {\n"id": {\n"from": "donor.hubmap_id",\n"to": "hubmap_id"\n},\n"cardinality": {\n"from": "many",\n"to": "one"\n}\n}\n}\n},\n{\n"name": "samples",\n"folder": "hubmap",\n"url": "./data/hubmap/samples.csv",\n"row_count": 2354,\n"column_count": 55,\n"columns": [\n{\n"name": "uuid",\n"data_type": "nominal",\n"cardinality": 2354\n},\n{\n"name": "hubmap_id",\n"data_type": "nominal",\n"cardinality": 2354\n},\n{\n"name": "PPID",\n"data_type": "quantitative",\n"cardinality": 3\n},\n{\n"name": "Preservation_condition",\n"data_type": "nominal",\n"cardinality": 3\n},\n{\n"name": "Preservation_media",\n"data_type": "nominal",\n"cardinality": 3\n},\n{\n"name": "cold_ischemia_time_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "cold_ischemia_time_value",\n"data_type": "quantitative",\n"cardinality": 78\n},\n{\n"name": "created_by_user_displayname",\n"data_type": "nominal",\n"cardinality": 30\n},\n{\n"name": "created_by_user_email",\n"data_type": "nominal",\n"cardinality": 33\n},\n{\n"name": "created_timestamp",\n"data_type": "quantitative",\n"cardinality": 1819\n},\n{\n"name": "donor.hubmap_id",\n"data_type": "nominal",\n"cardinality": 266\n},\n{\n"name": "file_row",\n"data_type": "quantitative",\n"cardinality": 9\n},\n{\n"name": "group_name",\n"data_type": "nominal",\n"cardinality": 16\n},\n{\n"name": "health_status",\n"data_type": "nominal",\n"cardinality": 5\n},\n{\n"name": "histological_report",\n"data_type": "quantitative",\n"cardinality": 1\n},\n{\n"name": "lab_id",\n"data_type": "nominal",\n"cardinality": 9\n},\n{\n"name": "last_modified_timestamp",\n"data_type": "quantitative",\n"cardinality": 1845\n},\n{\n"name": "mapped_consortium",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "mapped_statusdata_access_level",\n"data_type": "quantitative",\n"cardinality": 1\n},\n{\n"name": "metadata_schema_id",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "notes",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "organ_condition",\n"data_type": "nominal",\n"cardinality": 3\n},\n{\n"name": "origin_samples_unique_mapped_organs",\n"data_type": "nominal",\n"cardinality": 23\n},\n{\n"name": "pathname",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "pathologist_report",\n"data_type": "nominal",\n"cardinality": 15\n},\n{\n"name": "pathology_distance_unit",\n"data_type": "quantitative",\n"cardinality": 1\n},\n{\n"name": "pathology_distance_value",\n"data_type": "quantitative",\n"cardinality": 1\n},\n{\n"name": "perfusion_solution",\n"data_type": "nominal",\n"cardinality": 6\n},\n{\n"name": "preparation_condition",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "preparation_medium",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "preparation_protocol_doi",\n"data_type": "nominal",\n"cardinality": 3\n},\n{\n"name": "procedure_date",\n"data_type": "nominal",\n"cardinality": 68\n},\n{\n"name": "processing_time_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "processing_time_value",\n"data_type": "quantitative",\n"cardinality": 3\n},\n{\n"name": "published_timestamp",\n"data_type": "quantitative",\n"cardinality": 1\n},\n{\n"name": "quality_criteria",\n"data_type": "quantitative",\n"cardinality": 1\n},\n{\n"name": "sample_category",\n"data_type": "nominal",\n"cardinality": 4\n},\n{\n"name": "sample_id",\n"data_type": "nominal",\n"cardinality": 108\n},\n{\n"name": "source_id",\n"data_type": "nominal",\n"cardinality": 4\n},\n{\n"name": "source_storage_duration_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "source_storage_duration_value",\n"data_type": "quantitative",\n"cardinality": 4\n},\n{\n"name": "specimen_preservation_temperature",\n"data_type": "nominal",\n"cardinality": 5\n},\n{\n"name": "specimen_quality_criteria",\n"data_type": "nominal",\n"cardinality": 4\n},\n{\n"name": "specimen_tumor_distance_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "specimen_tumor_distance_value",\n"data_type": "quantitative",\n"cardinality": 12\n},\n{\n"name": "status",\n"data_type": "quantitative",\n"cardinality": 1\n},\n{\n"name": "storage_medium",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "storage_method",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "tissue_weight_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "tissue_weight_value",\n"data_type": "quantitative",\n"cardinality": 3\n},\n{\n"name": "vital_state",\n"data_type": "nominal",\n"cardinality": 3\n},\n{\n"name": "volume_unit",\n"data_type": "quantitative",\n"cardinality": 1\n},\n{\n"name": "volume_value",\n"data_type": "quantitative",\n"cardinality": 1\n},\n{\n"name": "warm_ischemia_time_unit",\n"data_type": "nominal",\n"cardinality": 3\n},\n{\n"name": "warm_ischemia_time_value",\n"data_type": "nominal",\n"cardinality": 12\n}\n],\n"relationships": {\n"donors": {\n"id": {\n"from": "donor.hubmap_id",\n"to": "hubmap_id"\n},\n"cardinality": {\n"from": "many",\n"to": "one"\n}\n}\n}\n},\n{\n"name": "donors",\n"folder": "hubmap",\n"url": "./data/hubmap/donors.csv",\n"row_count": 266,\n"column_count": 40,\n"columns": [\n{\n"name": "uuid",\n"data_type": "nominal",\n"cardinality": 266\n},\n{\n"name": "hubmap_id",\n"data_type": "nominal",\n"cardinality": 266\n},\n{\n"name": "abo_blood_group_system",\n"data_type": "nominal",\n"cardinality": 6\n},\n{\n"name": "age_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "age_value",\n"data_type": "quantitative",\n"cardinality": 125\n},\n{\n"name": "apolipoprotein_e_phenotype",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "body_mass_index_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "body_mass_index_value",\n"data_type": "quantitative",\n"cardinality": 151\n},\n{\n"name": "cause_of_death",\n"data_type": "nominal",\n"cardinality": 9\n},\n{\n"name": "created_by_user_displayname",\n"data_type": "nominal",\n"cardinality": 19\n},\n{\n"name": "created_by_user_email",\n"data_type": "nominal",\n"cardinality": 21\n},\n{\n"name": "created_timestamp",\n"data_type": "quantitative",\n"cardinality": 266\n},\n{\n"name": "death_event",\n"data_type": "nominal",\n"cardinality": 6\n},\n{\n"name": "egfr_ckd_epi_2021__unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "egfr_ckd_epi_2021__value",\n"data_type": "quantitative",\n"cardinality": 3\n},\n{\n"name": "ethnicity",\n"data_type": "nominal",\n"cardinality": 3\n},\n{\n"name": "gestational_age_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "gestational_age_value",\n"data_type": "quantitative",\n"cardinality": 8\n},\n{\n"name": "group_name",\n"data_type": "nominal",\n"cardinality": 15\n},\n{\n"name": "height_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "height_value",\n"data_type": "quantitative",\n"cardinality": 52\n},\n{\n"name": "kidney_donor_profile_index_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "kidney_donor_profile_index_value",\n"data_type": "quantitative",\n"cardinality": 26\n},\n{\n"name": "last_modified_timestamp",\n"data_type": "quantitative",\n"cardinality": 266\n},\n{\n"name": "mapped_consortium",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "mapped_statusdata_access_level",\n"data_type": "quantitative",\n"cardinality": 1\n},\n{\n"name": "mechanism_of_injury",\n"data_type": "nominal",\n"cardinality": 12\n},\n{\n"name": "medical_history",\n"data_type": "nominal",\n"cardinality": 55\n},\n{\n"name": "other_anatomic_concept",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "pathology_note",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "published_timestamp",\n"data_type": "quantitative",\n"cardinality": 1\n},\n{\n"name": "race",\n"data_type": "nominal",\n"cardinality": 7\n},\n{\n"name": "rh_blood_group",\n"data_type": "nominal",\n"cardinality": 3\n},\n{\n"name": "serum_creatinine_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "serum_creatinine_value",\n"data_type": "quantitative",\n"cardinality": 3\n},\n{\n"name": "sex",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "social_history",\n"data_type": "nominal",\n"cardinality": 20\n},\n{\n"name": "status",\n"data_type": "quantitative",\n"cardinality": 1\n},\n{\n"name": "weight_unit",\n"data_type": "nominal",\n"cardinality": 2\n},\n{\n"name": "weight_value",\n"data_type": "quantitative",\n"cardinality": 110\n}\n],\n"relationships": {\n"samples": {\n"id": {\n"from": "hubmap_id",\n"to": "donor.hubmap_id"\n},\n"cardinality": {\n"from": "one",\n"to": "many"\n}\n},\n"datasets": {\n"id": {\n"from": "hubmap_id",\n"to": "donor.hubmap_id"\n},\n"cardinality": {\n"from": "one",\n"to": "many"\n}\n}\n}\n}\n]\n}\n Typically, your actions will use the provided functions. You have access to the following functions.',
      role: 'system',
    },
    {
      // content: 'So, how many donors do we have when we sort them by weight?',
      content: 'How many donors do we have when we sort them by weight?',
      role: 'user',
    },
  ];

  try {
    const response = await fetch(`${server}/udi/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        // tools,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI API response:', data);
    return data;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
  }
}

async function queryLLM() {
  llmResponding.value = true;

  const server = 'http://localhost:9090/v1';
  const model = 'agenticx/UDI-VIS-Beta-v0-Llama-3.1-8B';
  try {
    const response = await fetch(`${server}/udi/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: conversationStore.messages,
        // tools,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    // if (typeof data === 'string') {
    //   try {
    //     data = JSON.parse(data);
    //   } catch (e) {
    //     console.error('Failed to parse response as JSON:', e);
    //     throw new Error('Invalid response format');
    //   }
    // }
    console.log('OpenAI API response:', data);

    conversationStore.messages.push({
      content: '',
      role: 'assistant',
      tool_calls: [{ name: 'RenderVisualization', arguments: { spec: data } }],
    });
    scrollToBottom();

    // return data;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
  }

  // const response = await ollama.chat({
  //   model: 'llama3.1',
  //   messages: conversationStore.messages,
  //   tools: agentTools,
  //   stream,
  // });

  // add empty message to add the chunks to
  // if (stream) {
  //   conversationStore.messages.push({ content: '', role: 'assistant' });
  //   // @ts-expect-error: typing matches stream boolean

  //   for await (const chunk of response) {
  //     const newText = chunk.message.content;
  //     const lastMsg = conversationStore.messages[conversationStore.messages.length - 1];
  //     if (lastMsg && typeof lastMsg.content === 'string') {
  //       lastMsg.content += newText;
  //     }
  //     scrollToBottom();
  //   }
  // } else {
  //   conversationStore.messages.push({
  //     content: response.message.content,
  //     role: 'assistant',
  //     tool_calls: response.message.tool_calls ?? [],
  //   });
  //   scrollToBottom();
  // }

  llmResponding.value = false;
}

function scrollToBottom() {
  setTimeout(() => {
    messageArea.value?.setScrollPercentage('vertical', 1.0, 50);
  }, 50);
}

function saveConversation() {
  const conversation = JSON.stringify(conversationStore.messages);
  const blob = new Blob([conversation], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'conversation.json';
  a.click();
}

function bgColor(role: 'user' | 'system' | 'assistant'): string {
  switch (role) {
    case 'user':
      return 'primary';
    case 'system':
      return 'orange-4';
    case 'assistant':
      return 'grey-1';
  }
}

function textColor(role: 'user' | 'system' | 'assistant'): string {
  switch (role) {
    case 'user':
      return 'white';
    case 'system':
      return 'black';
    case 'assistant':
      return 'black';
  }
}

const showDebugInfo = ref<boolean>(false);
const showSystemTools = ref<boolean>(false);
const showSystemPrompts = ref<boolean>(false);
const displayedMessages = computed(() =>
  conversationStore.messages.filter(
    (message) => message.role !== 'system' || showSystemPrompts.value,
  ),
);

function shouldRenderUdiGrammar(message: Message, index: number): boolean {
  if (message.role !== 'assistant') {
    return false;
  }
  if (index === displayedMessages.value.length - 1 && llmResponding.value) {
    return false;
  }
  if (renderChoice.value !== 'udi') {
    return false;
  }
  return true;
}

function shouldRenderVega(message: Message, index: number): boolean {
  if (message.role !== 'assistant') {
    return false;
  }
  if (index === displayedMessages.value.length - 1 && llmResponding.value) {
    return false;
  }
  if (renderChoice.value !== 'vega') {
    return false;
  }
  return true;
}

function shouldRenderDSL(message: Message, index: number): boolean {
  if (message.role !== 'assistant') {
    return false;
  }
  if (index === displayedMessages.value.length - 1 && llmResponding.value) {
    return false;
  }
  if (renderChoice.value !== 'dsl') {
    return false;
  }
  return true;
}

function shouldRenderDSLFunction(message: Message, index: number): boolean {
  if (message.role !== 'assistant') {
    return false;
  }
  if (index === displayedMessages.value.length - 1 && llmResponding.value) {
    return false;
  }
  if (renderChoice.value !== 'dsl_func') {
    return false;
  }
  if (!message.tool_calls || message.tool_calls.length === 0) {
    return false;
  }

  return true;
}

const renderChoice = ref<'vega' | 'none' | 'dsl' | 'dsl_func' | 'udi'>('udi');
const renderChoices = ['udi', 'vega', 'none', 'dsl', 'dsl_func'];

function firstToolCall(message: {
  role: 'user' | 'system' | 'assistant';
  content: string;
  tool_calls?: {
    function: {
      name: string;
      arguments: unknown;
    };
  }[];
}): ToolCall {
  return message.tool_calls![0] as ToolCall;
}

function extractUdiSpecFromMessage(message: Message): object | null {
  if (message.role !== 'assistant' || !message.tool_calls || message.tool_calls.length === 0) {
    return null;
  }
  const firstToolCall = message.tool_calls[0];
  if (!firstToolCall) return null;
  // const functionCall = firstToolCall.function;
  // if (!functionCall) return null;
  if (firstToolCall.name !== 'RenderVisualization') return null;
  const functionArgs = firstToolCall.arguments;
  if (!functionArgs) return null;
  const specString = functionArgs.spec;
  let spec: object | null = null;
  if (!specString) return null;
  if (typeof specString === 'string') {
    try {
      spec = JSON.parse(specString);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      throw new Error('Invalid response format');
    }
  }
  // console.log('bkargen flaragnen');
  return spec;
  // try {
  //   const spec = JSON.parse(specString);
  //   return spec;
  // } catch (error: unknown) {
  //   console.warn('LLM generated invalid spec.');
  //   if (error instanceof Error) {
  //     console.warn('Error parsing UDI spec:', error.message);
  //   } else {
  //     console.warn('Unknown error parsing UDI spec:', error);
  //   }
  //   return null;
  // }
}
</script>

<template>
  <!-- <div>Really dumb test.</div>
  <div style="width: 100%; outline: solid red 2px">
    <UDIVis
      :spec="{
        source: {
          name: 'donors',
          source: 'https://vispubs.com/data/papers.csv',
        },
        transformation: [
          {
            groupby: ['Year', 'Conference'],
          },
          {
            rollup: {
              paper_count: { op: 'count' },
            },
          },
        ],
      }"
    ></UDIVis>
  </div> -->
  <!-- <div style="outline: solid red 3px">
    <VegaLite :spec="spec"> </VegaLite>
  </div> -->
  <q-separator />
  <q-scroll-area ref="messageArea" class="q-mt-md flex-grow-1" style="height: 1px; width: 800px">
    <q-chat-message
      v-if="showSystemTools"
      :bg-color="bgColor('system')"
      :text-color="textColor('system')"
      :sent="true"
      name="tools"
    >
      <div style="white-space: pre-wrap">
        {{ JSON.stringify(agentTools, null, 4) }}
      </div>
    </q-chat-message>
    <q-chat-message
      v-for="(message, i) in displayedMessages"
      class="q-mr-lg q-ml-lg"
      :key="i"
      :sent="message.role === 'user' || message.role === 'system'"
      :name="message.role"
      :bg-color="bgColor(message.role)"
      :text-color="textColor(message.role)"
    >
      <q-markdown
        v-if="showDebugInfo && message.role === 'assistant'"
        :src="JSON.stringify(message)"
      ></q-markdown>
      <q-markdown
        v-if="showDebugInfo && message.role === 'assistant' && shouldRenderUdiGrammar(message, i)"
        :src="JSON.stringify(extractUdiSpecFromMessage(message))"
      ></q-markdown>
      <q-markdown v-if="message.content" :src="message.content"></q-markdown>
      <div style="width: 400px" v-if="shouldRenderUdiGrammar(message, i)">
        <UDIVis :spec="extractUdiSpecFromMessage(message)"></UDIVis>
      </div>
      <VegaLite v-if="shouldRenderVega(message, i)" :spec="message.content"> </VegaLite>
      <DSLVis v-if="shouldRenderDSL(message, i)" :spec="message.content"></DSLVis>
      <DSLVisFunc
        v-if="shouldRenderDSLFunction(message, i)"
        :spec="firstToolCall(message)"
      ></DSLVisFunc>
    </q-chat-message>
    <q-chat-message
      v-if="llmResponding && displayedMessages[displayedMessages.length - 1]?.role !== 'assistant'"
      class="q-mr-lg q-ml-lg"
      :sent="false"
      :bg-color="bgColor('assistant')"
      text-color="primary"
      ><q-spinner-puff size="lg"
    /></q-chat-message>
  </q-scroll-area>

  <div class="flex w-800 q-mt-md column justify-end">
    <q-input
      class="full-width q-pb-sm"
      v-model="inputText"
      filled
      autogrow
      type="textarea"
      @keydown.enter="sendMessage"
    />
    <q-toolbar class="q-mb-lg">
      <q-btn
        class="q-mr-sm"
        @click="saveConversation"
        :disable="llmResponding"
        icon-right="save"
        label="Save"
      ></q-btn>
      <q-checkbox class="q-mr-sm" v-model="showDebugInfo" label="Debug" toggle-color="primary" />
      <q-checkbox class="q-mr-sm" v-model="showSystemTools" label="Tools" toggle-color="primary" />
      <q-checkbox
        class="q-mr-sm"
        v-model="showSystemPrompts"
        label="System Prompts"
        toggle-color="primary"
      />

      <q-select
        class="q-ml-sm q-mr-sm"
        style="width: 100px"
        dense
        v-model="renderChoice"
        :options="renderChoices"
        label="Render"
      />
      <q-space />
      <q-btn
        color="primary"
        @click="sendMessage"
        :disable="llmResponding"
        icon-right="send"
        label="Send"
      ></q-btn>
      <!-- <q-btn color="primary" @click="testOpenAI" icon-right="construction" label="TEST"></q-btn> -->
    </q-toolbar>
  </div>
</template>

<style scoped lang="scss">
.w-800 {
  width: 800px;
}

.flex-grow-1 {
  flex-grow: 1;
}
</style>
