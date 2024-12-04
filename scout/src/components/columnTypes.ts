export const columnTypes: Record<
  string,
  Record<string, 'string' | 'quantitative'>
> = {
  donors: {
    uuid: 'string',
    hubmap_id: 'string',
    abo_blood_group_system: 'string',
    age_unit: 'string',
    age_value: 'quantitative',
    apolipoprotein_e_phenotype: 'string',
    body_mass_index_unit: 'string',
    body_mass_index_value: 'quantitative',
    cause_of_death: 'string',
    created_by_user_displayname: 'string',
    created_by_user_email: 'string',
    created_timestamp: 'quantitative',
    death_event: 'string',
    egfr_ckd_epi_2021__unit: 'string',
    egfr_ckd_epi_2021__value: 'quantitative',
    ethnicity: 'string',
    gestational_age_unit: 'string',
    gestational_age_value: 'quantitative',
    group_name: 'string',
    height_unit: 'string',
    height_value: 'quantitative',
    kidney_donor_profile_index_unit: 'string',
    kidney_donor_profile_index_value: 'quantitative',
    last_modified_timestamp: 'quantitative',
    mapped_consortium: 'string',
    mapped_statusdata_access_level: 'quantitative',
    mechanism_of_injury: 'string',
    medical_history: 'string',
    other_anatomic_concept: 'string',
    pathology_note: 'string',
    published_timestamp: 'quantitative',
    race: 'string',
    rh_blood_group: 'string',
    serum_creatinine_unit: 'string',
    serum_creatinine_value: 'quantitative',
    sex: 'string',
    social_history: 'string',
    status: 'quantitative',
    weight_unit: 'string',
    weight_value: 'quantitative',
  },
  samples: {
    uuid: 'string',
    hubmap_id: 'string',
    PPID: 'quantitative',
    Preservation_condition: 'string',
    Preservation_media: 'string',
    cold_ischemia_time_unit: 'string',
    cold_ischemia_time_value: 'quantitative',
    created_by_user_displayname: 'string',
    created_by_user_email: 'string',
    created_timestamp: 'quantitative',
    'donor.hubmap_id': 'string',
    file_row: 'quantitative',
    group_name: 'string',
    health_status: 'string',
    histological_report: 'quantitative',
    lab_id: 'string',
    last_modified_timestamp: 'quantitative',
    mapped_consortium: 'string',
    mapped_statusdata_access_level: 'quantitative',
    metadata_schema_id: 'string',
    notes: 'string',
    organ_condition: 'string',
    origin_samples_unique_mapped_organs: 'string',
    pathname: 'string',
    pathologist_report: 'string',
    pathology_distance_unit: 'quantitative',
    pathology_distance_value: 'quantitative',
    perfusion_solution: 'string',
    preparation_condition: 'string',
    preparation_medium: 'string',
    preparation_protocol_doi: 'string',
    procedure_date: 'string',
    processing_time_unit: 'string',
    processing_time_value: 'quantitative',
    published_timestamp: 'quantitative',
    quality_criteria: 'quantitative',
    sample_category: 'string',
    sample_id: 'string',
    source_id: 'string',
    source_storage_duration_unit: 'string',
    source_storage_duration_value: 'quantitative',
    specimen_preservation_temperature: 'string',
    specimen_quality_criteria: 'string',
    specimen_tumor_distance_unit: 'string',
    specimen_tumor_distance_value: 'quantitative',
    status: 'quantitative',
    storage_medium: 'string',
    storage_method: 'string',
    tissue_weight_unit: 'string',
    tissue_weight_value: 'quantitative',
    vital_state: 'string',
    volume_unit: 'quantitative',
    volume_value: 'quantitative',
    warm_ischemia_time_unit: 'string',
    warm_ischemia_time_value: 'string',
  },
  datasets: {
    uuid: 'string',
    hubmap_id: 'string',
    ablation_distance_between_shots_x_units: 'string',
    ablation_distance_between_shots_x_value: 'quantitative',
    ablation_distance_between_shots_y_units: 'string',
    ablation_distance_between_shots_y_value: 'quantitative',
    ablation_frequency_unit: 'string',
    ablation_frequency_value: 'quantitative',
    acquisition_id: 'string',
    acquisition_instrument_model: 'string',
    acquisition_instrument_vendor: 'string',
    analyte_class: 'string',
    area_normalized_ion_dose_unit: 'string',
    area_normalized_ion_dose_value: 'quantitative',
    assay_category: 'string',
    assay_type: 'string',
    bead_barcode_offset: 'string',
    bead_barcode_read: 'string',
    bead_barcode_size: 'string',
    bulk_atac_cell_isolation_protocols_io_doi: 'string',
    bulk_rna_isolation_protocols_io_doi: 'string',
    bulk_rna_isolation_quality_metric_value: 'quantitative',
    bulk_rna_yield_units_per_tissue_unit: 'string',
    bulk_rna_yield_value: 'quantitative',
    bulk_transposition_input_number_nuclei: 'quantitative',
    cell_barcode_offset: 'string',
    cell_barcode_read: 'string',
    cell_barcode_size: 'string',
    created_by_user_displayname: 'string',
    created_by_user_email: 'string',
    created_timestamp: 'quantitative',
    data_collection_mode: 'string',
    data_precision_bytes: 'quantitative',
    description: 'string',
    desi_solvent: 'string',
    desi_solvent_flow_rate: 'quantitative',
    desi_solvent_flow_rate_unit: 'string',
    dms: 'string',
    dna_assay_input_unit: 'string',
    dna_assay_input_value: 'quantitative',
    'donor.hubmap_id': 'string',
    dual_count_start: 'quantitative',
    end_datetime: 'string',
    execution_datetime: 'string',
    expected_cell_count: 'quantitative',
    gdna_fragmentation_quality_assurance: 'string',
    group_name: 'string',
    increment_z_unit: 'string',
    increment_z_value: 'quantitative',
    ion_mobility: 'string',
    is_targeted: 'string',
    is_technical_replicate: 'string',
    labeling: 'string',
    last_modified_timestamp: 'quantitative',
    lc_column_model: 'string',
    lc_column_vendor: 'string',
    lc_flow_rate_unit: 'string',
    lc_flow_rate_value: 'quantitative',
    lc_gradient: 'string',
    lc_id_unit: 'string',
    lc_id_value: 'quantitative',
    lc_instrument_model: 'string',
    lc_instrument_vendor: 'string',
    lc_length_unit: 'string',
    lc_length_value: 'quantitative',
    lc_mobile_phase_a: 'string',
    lc_mobile_phase_b: 'string',
    lc_resin: 'string',
    lc_temp_unit: 'string',
    lc_temp_value: 'quantitative',
    library_adapter_sequence: 'string',
    library_average_fragment_size: 'quantitative',
    library_concentration_unit: 'string',
    library_concentration_value: 'quantitative',
    library_construction_method: 'string',
    library_construction_protocols_io_doi: 'string',
    library_creation_date: 'string',
    library_final_yield: 'quantitative',
    library_final_yield_unit: 'string',
    library_final_yield_value: 'quantitative',
    library_id: 'string',
    library_layout: 'string',
    library_pcr_cycles: 'quantitative',
    library_pcr_cycles_for_sample_index: 'quantitative',
    library_preparation_kit: 'string',
    mapped_consortium: 'string',
    mapped_statusdata_access_level: 'quantitative',
    mass_resolving_power: 'quantitative',
    max_x_width_unit: 'string',
    max_x_width_value: 'quantitative',
    max_y_height_unit: 'string',
    max_y_height_value: 'quantitative',
    ms_scan_mode: 'string',
    ms_source: 'string',
    mz_range_high_value: 'quantitative',
    mz_range_low_value: 'quantitative',
    mz_resolving_power: 'quantitative',
    number_of_antibodies: 'quantitative',
    number_of_barcode_probes: 'quantitative',
    number_of_barcode_regions_per_barcode_probe: 'quantitative',
    number_of_channels: 'quantitative',
    number_of_cycles: 'quantitative',
    number_of_imaging_rounds: 'quantitative',
    number_of_pseudocolors_per_channel: 'quantitative',
    number_of_readout_probes_per_channel: 'quantitative',
    number_of_sections: 'quantitative',
    operator: 'string',
    operator_email: 'string',
    origin_samples_unique_mapped_organs: 'string',
    overall_protocols_io_doi: 'string',
    pi: 'string',
    pi_email: 'string',
    pixel_dwell_time_unit: 'string',
    pixel_dwell_time_value: 'quantitative',
    pixel_size_x_unit: 'string',
    pixel_size_x_value: 'quantitative',
    pixel_size_y_unit: 'string',
    pixel_size_y_value: 'quantitative',
    polarity: 'string',
    preparation_instrument_model: 'string',
    preparation_instrument_vendor: 'string',
    preparation_maldi_matrix: 'string',
    preparation_type: 'string',
    primary_ion: 'string',
    primary_ion_current_unit: 'string',
    primary_ion_current_value: 'quantitative',
    processing_protocols_io_doi: 'string',
    processing_search: 'string',
    protocols_io_doi: 'string',
    published_timestamp: 'quantitative',
    puck_id: 'string',
    range_z_unit: 'string',
    range_z_value: 'quantitative',
    reagent_prep_protocols_io_doi: 'string',
    resolution_x_unit: 'string',
    resolution_x_value: 'quantitative',
    resolution_y_unit: 'string',
    resolution_y_value: 'quantitative',
    resolution_z_unit: 'string',
    resolution_z_value: 'quantitative',
    rnaseq_assay_input: 'quantitative',
    rnaseq_assay_input_unit: 'string',
    rnaseq_assay_input_value: 'quantitative',
    rnaseq_assay_method: 'string',
    roi_description: 'string',
    roi_id: 'quantitative',
    sample_quality_metric: 'string',
    sc_isolation_cell_number: 'quantitative',
    sc_isolation_enrichment: 'string',
    sc_isolation_entity: 'string',
    sc_isolation_protocols_io_doi: 'string',
    sc_isolation_quality_metric: 'string',
    sc_isolation_tissue_dissociation: 'string',
    section_prep_protocols_io_doi: 'string',
    segment_data_format: 'string',
    sequencing_phix_percent: 'quantitative',
    sequencing_read_format: 'string',
    sequencing_read_percent_q30: 'quantitative',
    sequencing_reagent_kit: 'string',
    signal_type: 'string',
    source_project: 'string',
    spatial_sampling_type: 'string',
    spatial_target: 'string',
    spatial_type: 'string',
    stain: 'string',
    start_datetime: 'string',
    status: 'string',
    step_z_value: 'quantitative',
    thumbnail_file_abs_path: 'string',
    transposition_input: 'quantitative',
    transposition_kit_number: 'string',
    transposition_method: 'string',
    transposition_transposase_source: 'string',
    umi_offset: 'quantitative',
    umi_read: 'string',
    umi_size: 'quantitative',
  },
};
