export interface ServiceCalc {
    type_service: string;         // Tipo de servicio, por ejemplo, "services"
    name_service: string;         // Nombre del servicio
    service_id: string;           // ID único del servicio
    service_type: string;         // Tipo de servicio, como "operator"
    operator_service_id: string;  // ID único del operador asociado al servicio
    selected: boolean;            // Indica si está seleccionado o no
  }