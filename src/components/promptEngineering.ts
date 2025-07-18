// export const initialPrompt: string | null = null;
// export const initialPrompt: string | null = `
// The user has a number of datasets that they would like to visualize. You have tools to render those visualizations. There are three datasets to choose from. Always pick one dataset, and then columns from each dataset.

import { dataPackageString, udiGrammarString } from './promptResources';

// There are three datasets to choose from, donors, samples, and datasets.

// The 'datasets' file has the following columns:
// uuid	hubmap_id	ablation_distance_between_shots_x_units	ablation_distance_between_shots_x_value	ablation_distance_between_shots_y_units	ablation_distance_between_shots_y_value	ablation_frequency_unit	ablation_frequency_value	acquisition_id	acquisition_instrument_model	acquisition_instrument_vendor	analyte_class	area_normalized_ion_dose_unit	area_normalized_ion_dose_value	assay_category	assay_type	bead_barcode_offset	bead_barcode_read	bead_barcode_size	bulk_atac_cell_isolation_protocols_io_doi	bulk_rna_isolation_protocols_io_doi	bulk_rna_isolation_quality_metric_value	bulk_rna_yield_units_per_tissue_unit	bulk_rna_yield_value	bulk_transposition_input_number_nuclei	cell_barcode_offset	cell_barcode_read	cell_barcode_size	created_by_user_displayname	created_by_user_email	created_timestamp	data_collection_mode	data_precision_bytes	description	desi_solvent	desi_solvent_flow_rate	desi_solvent_flow_rate_unit	dms	dna_assay_input_unit	dna_assay_input_value	donor.hubmap_id	dual_count_start	end_datetime	execution_datetime	expected_cell_count	gdna_fragmentation_quality_assurance	group_name	increment_z_unit	increment_z_value	ion_mobility	is_targeted	is_technical_replicate	labeling	last_modified_timestamp	lc_column_model	lc_column_vendor	lc_flow_rate_unit	lc_flow_rate_value	lc_gradient	lc_id_unit	lc_id_value	lc_instrument_model	lc_instrument_vendor	lc_length_unit	lc_length_value	lc_mobile_phase_a	lc_mobile_phase_b	lc_resin	lc_temp_unit	lc_temp_value	library_adapter_sequence	library_average_fragment_size	library_concentration_unit	library_concentration_value	library_construction_method	library_construction_protocols_io_doi	library_creation_date	library_final_yield	library_final_yield_unit	library_final_yield_value	library_id	library_layout	library_pcr_cycles	library_pcr_cycles_for_sample_index	library_preparation_kit	mapped_consortium	mapped_statusdata_access_level	mass_resolving_power	max_x_width_unit	max_x_width_value	max_y_height_unit	max_y_height_value	ms_scan_mode	ms_source	mz_range_high_value	mz_range_low_value	mz_resolving_power	number_of_antibodies	number_of_barcode_probes	number_of_barcode_regions_per_barcode_probe	number_of_channels	number_of_cycles	number_of_imaging_rounds	number_of_pseudocolors_per_channel	number_of_readout_probes_per_channel	number_of_sections	operator	operator_email	origin_samples_unique_mapped_organs	overall_protocols_io_doi	pi	pi_email	pixel_dwell_time_unit	pixel_dwell_time_value	pixel_size_x_unit	pixel_size_x_value	pixel_size_y_unit	pixel_size_y_value	polarity	preparation_instrument_model	preparation_instrument_vendor	preparation_maldi_matrix	preparation_type	primary_ion	primary_ion_current_unit	primary_ion_current_value	processing_protocols_io_doi	processing_search	protocols_io_doi	published_timestamp	puck_id	range_z_unit	range_z_value	reagent_prep_protocols_io_doi	resolution_x_unit	resolution_x_value	resolution_y_unit	resolution_y_value	resolution_z_unit	resolution_z_value	rnaseq_assay_input	rnaseq_assay_input_unit	rnaseq_assay_input_value	rnaseq_assay_method	roi_description	roi_id	sample_quality_metric	sc_isolation_cell_number	sc_isolation_enrichment	sc_isolation_entity	sc_isolation_protocols_io_doi	sc_isolation_quality_metric	sc_isolation_tissue_dissociation	section_prep_protocols_io_doi	segment_data_format	sequencing_phix_percent	sequencing_read_format	sequencing_read_percent_q30	sequencing_reagent_kit	signal_type	source_project	spatial_sampling_type	spatial_target	spatial_type	stain	start_datetime	status	step_z_value	thumbnail_file_abs_path	transposition_input	transposition_kit_number	transposition_method	transposition_transposase_source	umi_offset	umi_read	umi_size

// The 'donors' file has the following columns:
// uuid	hubmap_id	abo_blood_group_system	age_unit	age_value	apolipoprotein_e_phenotype	body_mass_index_unit	body_mass_index_value	cause_of_death	created_by_user_displayname	created_by_user_email	created_timestamp	death_event	egfr_ckd_epi_2021__unit	egfr_ckd_epi_2021__value	ethnicity	gestational_age_unit	gestational_age_value	group_name	height_unit	height_value	kidney_donor_profile_index_unit	kidney_donor_profile_index_value	last_modified_timestamp	mapped_consortium	mapped_statusdata_access_level	mechanism_of_injury	medical_history	other_anatomic_concept	pathology_note	published_timestamp	race	rh_blood_group	serum_creatinine_unit	serum_creatinine_value	sex	social_history	status	weight_unit	weight_value

// The 'samples' file has the following columns:
// uuid	hubmap_id	PPID	Preservation_condition	Preservation_media	cold_ischemia_time_unit	cold_ischemia_time_value	created_by_user_displayname	created_by_user_email	created_timestamp	donor.hubmap_id	file_row	group_name	health_status	histological_report	lab_id	last_modified_timestamp	mapped_consortium	mapped_statusdata_access_level	metadata_schema_id	notes	organ_condition	origin_samples_unique_mapped_organs	pathname	pathologist_report	pathology_distance_unit	pathology_distance_value	perfusion_solution	preparation_condition	preparation_medium	preparation_protocol_doi	procedure_date	processing_time_unit	processing_time_value	published_timestamp	quality_criteria	sample_category	sample_id	source_id	source_storage_duration_unit	source_storage_duration_value	specimen_preservation_temperature	specimen_quality_criteria	specimen_tumor_distance_unit	specimen_tumor_distance_value	status	storage_medium	storage_method	tissue_weight_unit	tissue_weight_value	vital_state	volume_unit	volume_value	warm_ischemia_time_unit	warm_ischemia_time_value
// `;

export const initialPrompt: string | null = `
You are a helpful assistant that will explore, and analyze datasets with visualizations. The following defines the available datasets:
${dataPackageString}
Typically, your actions will use the provided functions. You have access to the following functions.`;
// Together we will build a visualization! This visualization will always be for a single tabular dataset. This dataset has the following columnrs:
// uuid	hubmap_id	ablation_distance_between_shots_x_units	ablation_distance_between_shots_x_value	ablation_distance_between_shots_y_units	ablation_distance_between_shots_y_value	ablation_frequency_unit	ablation_frequency_value	acquisition_id	acquisition_instrument_model	acquisition_instrument_vendor	analyte_class	area_normalized_ion_dose_unit	area_normalized_ion_dose_value	assay_category	assay_type	bead_barcode_offset	bead_barcode_read	bead_barcode_size	bulk_atac_cell_isolation_protocols_io_doi	bulk_rna_isolation_protocols_io_doi	bulk_rna_isolation_quality_metric_value	bulk_rna_yield_units_per_tissue_unit	bulk_rna_yield_value	bulk_transposition_input_number_nuclei	cell_barcode_offset	cell_barcode_read	cell_barcode_size	created_by_user_displayname	created_by_user_email	created_timestamp	data_collection_mode	data_precision_bytes	description	desi_solvent	desi_solvent_flow_rate	desi_solvent_flow_rate_unit	dms	dna_assay_input_unit	dna_assay_input_value	donor.hubmap_id	dual_count_start	end_datetime	execution_datetime	expected_cell_count	gdna_fragmentation_quality_assurance	group_name	increment_z_unit	increment_z_value	ion_mobility	is_targeted	is_technical_replicate	labeling	last_modified_timestamp	lc_column_model	lc_column_vendor	lc_flow_rate_unit	lc_flow_rate_value	lc_gradient	lc_id_unit	lc_id_value	lc_instrument_model	lc_instrument_vendor	lc_length_unit	lc_length_value	lc_mobile_phase_a	lc_mobile_phase_b	lc_resin	lc_temp_unit	lc_temp_value	library_adapter_sequence	library_average_fragment_size	library_concentration_unit	library_concentration_value	library_construction_method	library_construction_protocols_io_doi	library_creation_date	library_final_yield	library_final_yield_unit	library_final_yield_value	library_id	library_layout	library_pcr_cycles	library_pcr_cycles_for_sample_index	library_preparation_kit	mapped_consortium	mapped_statusdata_access_level	mass_resolving_power	max_x_width_unit	max_x_width_value	max_y_height_unit	max_y_height_value	ms_scan_mode	ms_source	mz_range_high_value	mz_range_low_value	mz_resolving_power	number_of_antibodies	number_of_barcode_probes	number_of_barcode_regions_per_barcode_probe	number_of_channels	number_of_cycles	number_of_imaging_rounds	number_of_pseudocolors_per_channel	number_of_readout_probes_per_channel	number_of_sections	operator	operator_email	origin_samples_unique_mapped_organs	overall_protocols_io_doi	pi	pi_email	pixel_dwell_time_unit	pixel_dwell_time_value	pixel_size_x_unit	pixel_size_x_value	pixel_size_y_unit	pixel_size_y_value	polarity	preparation_instrument_model	preparation_instrument_vendor	preparation_maldi_matrix	preparation_type	primary_ion	primary_ion_current_unit	primary_ion_current_value	processing_protocols_io_doi	processing_search	protocols_io_doi	published_timestamp	puck_id	range_z_unit	range_z_value	reagent_prep_protocols_io_doi	resolution_x_unit	resolution_x_value	resolution_y_unit	resolution_y_value	resolution_z_unit	resolution_z_value	rnaseq_assay_input	rnaseq_assay_input_unit	rnaseq_assay_input_value	rnaseq_assay_method	roi_description	roi_id	sample_quality_metric	sc_isolation_cell_number	sc_isolation_enrichment	sc_isolation_entity	sc_isolation_protocols_io_doi	sc_isolation_quality_metric	sc_isolation_tissue_dissociation	section_prep_protocols_io_doi	segment_data_format	sequencing_phix_percent	sequencing_read_format	sequencing_read_percent_q30	sequencing_reagent_kit	signal_type	source_project	spatial_sampling_type	spatial_target	spatial_type	stain	start_datetime	status	step_z_value	thumbnail_file_abs_path	transposition_input	transposition_kit_number	transposition_method	transposition_transposase_source	umi_offset	umi_read	umi_size

// I actually will build the visualization, but I would like you to help me pick the variables to visualize. Always select one, two, or three variables. And give the answer in a simple list in the format of ["var1", "var2", "var3"].

// Here are some examples for answer I would want based on questions.

// Show me a bar chart of the number of people by year:
// ["year", "people"]

// Show me a scatter plot of temperature by humidity:
// ["temperature", "humidity"]

// How many datasets by assay type are there?
// ["assay_type"]

// These are general examples of the format, you should always pick the variable based on the query and ALWAYS make sure to only select variables from the column names I provided.
// `,

export const interstitialPrompt: string | null = null;
// `
// This is a test
// `;

export const tools = [
  // {
  //   type: 'function',
  //   function: {
  //     name: 'generateRandomNumber',
  //     description:
  //       'Generates a random number integer between a minimum and maximum value.',
  //     parameters: {
  //       type: 'object',
  //       properties: {
  //         min: {
  //           type: 'number',
  //           description: 'The minimum value for the random number.',
  //         },
  //         max: {
  //           type: 'number',
  //           description: 'The maximum value for the random number.',
  //         },
  //       },
  //       required: ['min', 'max'],
  //     },
  //   },
  // },
  {
    type: 'function',
    function: {
      name: 'createVisualization',
      description:
        'Generates a visualization of the data. Depending on the fields selected the visualization will be different. E.g. selecting a single field may result in a bar chart or histogram and selecting two fields may result in a stacked bar chart or scatterplot.',
      parameters: {
        type: 'object',
        properties: {
          spec: {
            type: 'object',
            description: 'The visualization specification defined by the UDIGrammar Json Schema.',
          },
        },
        required: ['spec'],
      },
    },
  },
];

// enum: [
//   'uuid',
//   'hubmap_id',
//   'ablation_distance_between_shots_x_units',
//   'ablation_distance_between_shots_x_value',
//   'ablation_distance_between_shots_y_units',
//   'ablation_distance_between_shots_y_value',
//   'ablation_frequency_unit',
//   'ablation_frequency_value',
//   'acquisition_id',
//   'acquisition_instrument_model',
//   'acquisition_instrument_vendor',
//   'analyte_class',
//   'area_normalized_ion_dose_unit',
//   'area_normalized_ion_dose_value',
//   'assay_category',
//   'assay_type',
//   'bead_barcode_offset',
//   'bead_barcode_read',
//   'bead_barcode_size',
//   'bulk_atac_cell_isolation_protocols_io_doi',
//   'bulk_rna_isolation_protocols_io_doi',
//   'bulk_rna_isolation_quality_metric_value',
//   'bulk_rna_yield_units_per_tissue_unit',
//   'bulk_rna_yield_value',
//   'bulk_transposition_input_number_nuclei',
//   'cell_barcode_offset',
//   'cell_barcode_read',
//   'cell_barcode_size',
//   'created_by_user_displayname',
//   'created_by_user_email',
//   'created_timestamp',
//   'data_collection_mode',
//   'data_precision_bytes',
//   'description',
//   'desi_solvent',
//   'desi_solvent_flow_rate',
//   'desi_solvent_flow_rate_unit',
//   'dms',
//   'dna_assay_input_unit',
//   'dna_assay_input_value',
//   'donor.hubmap_id',
//   'dual_count_start',
//   'end_datetime',
//   'execution_datetime',
//   'expected_cell_count',
//   'gdna_fragmentation_quality_assurance',
//   'group_name',
//   'increment_z_unit',
//   'increment_z_value',
//   'ion_mobility',
//   'is_targeted',
//   'is_technical_replicate',
//   'labeling',
//   'last_modified_timestamp',
//   'lc_column_model',
//   'lc_column_vendor',
//   'lc_flow_rate_unit',
//   'lc_flow_rate_value',
//   'lc_gradient',
//   'lc_id_unit',
//   'lc_id_value',
//   'lc_instrument_model',
//   'lc_instrument_vendor',
//   'lc_length_unit',
//   'lc_length_value',
//   'lc_mobile_phase_a',
//   'lc_mobile_phase_b',
//   'lc_resin',
//   'lc_temp_unit',
//   'lc_temp_value',
//   'library_adapter_sequence',
//   'library_average_fragment_size',
//   'library_concentration_unit',
//   'library_concentration_value',
//   'library_construction_method',
//   'library_construction_protocols_io_doi',
//   'library_creation_date',
//   'library_final_yield',
//   'library_final_yield_unit',
//   'library_final_yield_value',
//   'library_id',
//   'library_layout',
//   'library_pcr_cycles',
//   'library_pcr_cycles_for_sample_index',
//   'library_preparation_kit',
//   'mapped_consortium',
//   'mapped_statusdata_access_level',
//   'mass_resolving_power',
//   'max_x_width_unit',
//   'max_x_width_value',
//   'max_y_height_unit',
//   'max_y_height_value',
//   'ms_scan_mode',
//   'ms_source',
//   'mz_range_high_value',
//   'mz_range_low_value',
//   'mz_resolving_power',
//   'number_of_antibodies',
//   'number_of_barcode_probes',
//   'number_of_barcode_regions_per_barcode_probe',
//   'number_of_channels',
//   'number_of_cycles',
//   'number_of_imaging_rounds',
//   'number_of_pseudocolors_per_channel',
//   'number_of_readout_probes_per_channel',
//   'number_of_sections',
//   'operator',
//   'operator_email',
//   'origin_samples_unique_mapped_organs',
//   'overall_protocols_io_doi',
//   'pi',
//   'pi_email',
//   'pixel_dwell_time_unit',
//   'pixel_dwell_time_value',
//   'pixel_size_x_unit',
//   'pixel_size_x_value',
//   'pixel_size_y_unit',
//   'pixel_size_y_value',
//   'polarity',
//   'preparation_instrument_model',
//   'preparation_instrument_vendor',
//   'preparation_maldi_matrix',
//   'preparation_type',
//   'primary_ion',
//   'primary_ion_current_unit',
//   'primary_ion_current_value',
//   'processing_protocols_io_doi',
//   'processing_search',
//   'protocols_io_doi',
//   'published_timestamp',
//   'puck_id',
//   'range_z_unit',
//   'range_z_value',
//   'reagent_prep_protocols_io_doi',
//   'resolution_x_unit',
//   'resolution_x_value',
//   'resolution_y_unit',
//   'resolution_y_value',
//   'resolution_z_unit',
//   'resolution_z_value',
//   'rnaseq_assay_input',
//   'rnaseq_assay_input_unit',
//   'rnaseq_assay_input_value',
//   'rnaseq_assay_method',
//   'roi_description',
//   'roi_id',
//   'sample_quality_metric',
//   'sc_isolation_cell_number',
//   'sc_isolation_enrichment',
//   'sc_isolation_entity',
//   'sc_isolation_protocols_io_doi',
//   'sc_isolation_quality_metric',
//   'sc_isolation_tissue_dissociation',
//   'section_prep_protocols_io_doi',
//   'segment_data_format',
//   'sequencing_phix_percent',
//   'sequencing_read_format',
//   'sequencing_read_percent_q30',
//   'sequencing_reagent_kit',
//   'signal_type',
//   'source_project',
//   'spatial_sampling_type',
//   'spatial_target',
//   'spatial_type',
//   'stain',
//   'start_datetime',
//   'status',
//   'step_z_value',
//   'thumbnail_file_abs_path',
//   'transposition_input',
//   'transposition_kit_number',
//   'transposition_method',
//   'transposition_transposase_source',
//   'umi_offset',
//   'umi_read',
//   'umi_size',
// ],
